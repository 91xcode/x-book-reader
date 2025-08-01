import { TTSClient, TTSMessageEvent, TTSVoice, TTSVoicesGroup, TTSGranularity, EdgeTTSPayload } from '@/types/tts';
import { EdgeSpeechTTS } from '@lobehub/tts';
import { EDGE_VOICES, type EdgeVoice } from '@/data/edgeVoices';
import { parseSSMLMarks, TTSUtils } from './utils';
import crypto from 'crypto';

// 简单的音频缓存实现
class AudioCache {
  private cache = new Map<string, ArrayBuffer>();
  private maxSize = 200;

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): ArrayBuffer | undefined {
    return this.cache.get(key);
  }

  set(key: string, data: ArrayBuffer): void {
    if (this.cache.size >= this.maxSize) {
      // 删除最旧的条目  
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, data);
  }

  get size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}

export class EdgeTTSClient implements TTSClient {
  name = 'edge-tts';
  initialized = false;
  controller?: any;

  #voices: TTSVoice[] = [];
  #primaryLang = 'en';
  #speakingLang = '';
  #currentVoiceId = '';
  #rate = 1.0;
  #pitch = 1.0;

  #edgeTTS: EdgeSpeechTTS;
  #audioElement: HTMLAudioElement | null = null;
  #isPlaying = false;
  #pausedAt = 0;
  #startedAt = 0;

  // 音频缓存
  private static audioCache = new AudioCache();

  constructor(controller?: any) {
    this.controller = controller;
    this.#edgeTTS = new EdgeSpeechTTS();
  }

  async init() {
    this.#voices = this.loadVoices();
    try {
      await this.#edgeTTS.create({
        input: 'test',
        options: {
          voice: 'en-US-AriaNeural',
        }
      });
      this.initialized = true;
    } catch {
      this.initialized = false;
    }
    return this.initialized;
  }

  private loadVoices(): TTSVoice[] {
    // 将 EDGE_VOICES 转换为 TTSVoice 格式（完全匹配readest架构）
    return EDGE_VOICES.map(voice => ({
      id: voice.shortName,
      name: voice.name,
      lang: voice.locale,
      disabled: false,
    }));
  }

  getPayload = (lang: string, text: string, voiceId: string): EdgeTTSPayload => {
    return { lang, text, voice: voiceId, rate: this.#rate, pitch: this.#pitch };
  };

  getVoiceIdFromLang = async (lang: string) => {
    const preferredVoiceId = TTSUtils.getPreferredVoice(this.name, lang);
    const preferredVoice = this.#voices.find((v) => v.id === preferredVoiceId);
    const defaultVoice = preferredVoice
      ? preferredVoice
      : (await this.getVoices(lang))[0]?.voices[0] || null;
    return defaultVoice?.id || this.#currentVoiceId || 'en-US-AriaNeural';
  };
  
  async *speak(ssml: string, signal: AbortSignal, preload = false): AsyncIterable<TTSMessageEvent> {
    const { marks } = parseSSMLMarks(ssml, this.#primaryLang);
    
    if (!marks || marks.length === 0) {
      console.warn('⚠️ No marks found in SSML');
      yield { code: 'error', message: 'No marks found in SSML' };
      return;
    }

    if (preload) {
      // 预加载前2个mark，其余在后台加载（匹配readest逻辑）
      const maxImmediate = 2;
      for (let i = 0; i < Math.min(maxImmediate, marks.length); i++) {
        const mark = marks[i]!;
        const { language: voiceLang } = mark;
        const voiceId = await this.getVoiceIdFromLang(voiceLang);
        this.#currentVoiceId = voiceId;
        try {
          await this.createCachedAudio(mark.text, voiceId, true); // 标记为预加载
        } catch (err) {
          console.warn('❌ Error preloading mark', i, err);
        }
      }
      if (marks.length > maxImmediate) {
        (async () => {
          for (let i = maxImmediate; i < marks.length; i++) {
            const mark = marks[i]!;
            try {
              const { language: voiceLang } = mark;
              const voiceId = await this.getVoiceIdFromLang(voiceLang);
              await this.createCachedAudio(mark.text, voiceId, true); // 标记为预加载
            } catch (err) {
              console.warn('Error preloading mark (bg)', i, err);
            }
          }
        })();
      }

      yield {
        code: 'end',
        message: 'Preload finished',
      };
      return;
    } else {
      await this.stopInternal();
    }

    for (const mark of marks) {
      if (signal.aborted) {
        yield {
          code: 'error',
          message: 'Aborted',
        };
        break;
      }
      try {
        const { language: voiceLang } = mark;
        const voiceId = await this.getVoiceIdFromLang(voiceLang);
        this.#speakingLang = voiceLang;
        
        const blob = await this.createCachedAudio(mark.text.trim(), voiceId, false); // 实际播放
        
        if (blob.size === 0) {
          console.error('❌ Audio blob is empty!');
          yield { code: 'error', message: 'Empty audio blob received' };
          continue;
        }
        
        const url = URL.createObjectURL(blob);
        
        this.#audioElement = new Audio(url);
        const audio = this.#audioElement;
        audio.setAttribute('x-webkit-airplay', 'deny');
        audio.preload = 'auto';

        // 通知controller播放mark（匹配readest）
        this.controller?.dispatchSpeakMark?.(mark);
        yield {
          code: 'boundary',
          message: `Start chunk: ${mark.name}`,
          mark: mark.name,
        };

        const result = await new Promise<TTSMessageEvent>((resolve) => {
          const cleanUp = () => {
            audio.onended = null;
            audio.onerror = null;
            audio.pause();
            audio.src = '';
            URL.revokeObjectURL(url);
            // 清空当前音频引用（如果是当前正在播放的）
            if (this.#audioElement === audio) {
              this.#audioElement = null;
            }
          };
          
          // 监听AbortSignal
          const abortHandler = () => {
            cleanUp();
            resolve({ code: 'error', message: 'Aborted' });
          };
          signal.addEventListener('abort', abortHandler);
          
          audio.onended = () => {
            signal.removeEventListener('abort', abortHandler);
            cleanUp();
            if (signal.aborted) {
              resolve({ code: 'error', message: 'Aborted' });
            } else {
              resolve({ code: 'end', message: `Chunk finished: ${mark.name}` });
            }
          };
          audio.onerror = (e) => {
            signal.removeEventListener('abort', abortHandler);
            cleanUp();
            console.warn('Audio playback error:', e);
            resolve({ code: 'error', message: 'Audio playback error' });
          };
          if (signal.aborted) {
            cleanUp();
            resolve({ code: 'error', message: 'Aborted' });
            return;
          }
          this.#isPlaying = true;
          audio.play().then(() => {
            // Audio started successfully
          }).catch((err) => {
            signal.removeEventListener('abort', abortHandler);
            cleanUp();
            console.error('❌ Failed to play audio:', err);
            resolve({ code: 'error', message: 'Playback failed: ' + err.message });
          });
        });
        yield result;
      } catch (error) {
        if (error instanceof Error && error.message === 'No audio data received.') {
          console.warn('No audio data received for:', mark.text);
          yield {
            code: 'end',
            message: `Chunk finished: ${mark.name}`,
          };
          continue;
        }
        console.log('Error:', error);
        yield {
          code: 'error',
          message: error instanceof Error ? error.message : String(error),
        };
        break;
      }

      await this.stopInternal();
    }
  }
  
  async pause(): Promise<boolean> {
    if (!this.#isPlaying || !this.#audioElement) return true;
    this.#pausedAt = this.#audioElement.currentTime - this.#startedAt;
    await this.#audioElement.pause();
    this.#isPlaying = false;
    return true;
  }

  async resume(): Promise<boolean> {
    if (this.#isPlaying || !this.#audioElement) return true;
    await this.#audioElement.play();
    this.#isPlaying = true;
    this.#startedAt = this.#audioElement.currentTime - this.#pausedAt;
    return true;
  }

  async stop(): Promise<void> {
    await this.stopInternal();
  }

  private async stopInternal(): Promise<void> {
    this.#isPlaying = false;
    this.#pausedAt = 0;
    this.#startedAt = 0;
    if (this.#audioElement) {
      this.#audioElement.pause();
      this.#audioElement.currentTime = 0;
      if (this.#audioElement?.onended) {
        this.#audioElement.onended(new Event('stopped'));
      }
      if (this.#audioElement.src?.startsWith('blob:')) {
        URL.revokeObjectURL(this.#audioElement.src);
      }
      this.#audioElement.src = '';
      this.#audioElement = null;
    }
  }



  private getCacheKey(text: string, voiceId: string): string {
    const payload = {
      text: text.trim(),
      voice: voiceId,
      rate: this.#rate,
      pitch: this.#pitch,
    };
    return crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
  }

  private async createCachedAudio(text: string, voiceId: string, isPreload: boolean = false): Promise<Blob> {
    const cacheKey = this.getCacheKey(text, voiceId);
    
    // 检查缓存
    if (EdgeTTSClient.audioCache.has(cacheKey)) {
      if (!isPreload) { // 只在实际播放时显示缓存命中日志
        console.log('🎯 使用缓存音频:', text.substring(0, 20) + '...');
      }
      const cachedData = EdgeTTSClient.audioCache.get(cacheKey)!;
      return new Blob([cachedData], { type: 'audio/mpeg' });
    }

    // 生成新音频
    const logPrefix = isPreload ? '📦 预加载音频:' : '🔊 生成新音频:';
    console.log(logPrefix, text.substring(0, 20) + '...');
    
    const response = await this.#edgeTTS.create({
      input: text,
      options: {
        voice: voiceId,
        ...(this.#rate !== 1.0 && { rate: this.#rate.toString() }),
        ...(this.#pitch !== 1.0 && { pitch: this.#pitch.toString() })
      }
    });
    
    const arrayBuffer = await response.arrayBuffer();
    
    // 缓存音频数据
    EdgeTTSClient.audioCache.set(cacheKey, arrayBuffer);
    if (!isPreload) { // 只在实际播放时显示缓存大小
      console.log('💾 音频已缓存，缓存大小:', EdgeTTSClient.audioCache.size);
    }
    
    return new Blob([arrayBuffer], { type: 'audio/mpeg' });
  }

  async setRate(rate: number): Promise<void> {
    // The Edge TTS API uses rate in [0.5 .. 2.0].
    this.#rate = rate;
  }

  async setPitch(pitch: number): Promise<void> {
    // The Edge TTS API uses pitch in [0.5 .. 1.5].
    this.#pitch = pitch;
  }

  async setVoice(voice: string): Promise<void> {
    const selectedVoice = this.#voices.find((v) => v.id === voice);
    if (selectedVoice) {
      this.#currentVoiceId = selectedVoice.id;
    }
  }

  async getAllVoices(): Promise<TTSVoice[]> {
    this.#voices.forEach((voice) => {
      voice.disabled = !this.initialized;
    });
    return this.#voices;
  }

  async getVoices(lang: string): Promise<TTSVoicesGroup[]> {
    const voices = await this.getAllVoices();
    const filteredVoices = voices.filter(
      (v) => v.lang.startsWith(lang) || (lang === 'en' && ['en-US', 'en-GB'].includes(v.lang)),
    );

    const voicesGroup: TTSVoicesGroup = {
      id: 'lobe-edge-tts',
      name: 'Lobe Edge TTS',
      voices: filteredVoices.sort(TTSUtils.sortVoicesFunc),
      disabled: !this.initialized || filteredVoices.length === 0,
    };

    return [voicesGroup];
  }

  setPrimaryLang(lang: string): void {
    this.#primaryLang = lang;
  }

  getGranularities(): TTSGranularity[] {
    return ['sentence'];
  }

  getVoiceId(): string {
    return this.#currentVoiceId;
  }

  getSpeakingLang(): string {
    return this.#speakingLang;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    this.#audioElement = null;
    this.#voices = [];
  }
}