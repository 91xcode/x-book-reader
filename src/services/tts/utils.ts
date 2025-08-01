import { TTSVoice, TTSMark } from '@/types/tts';

// 语言工具函数 - 简化版本（基于readest的语言处理逻辑）
const code6392to6391 = (lang: string): string | null => {
  // 这里可以扩展更多的语言代码转换
  const codeMap: Record<string, string> = {
    'chi': 'zh',
    'zho': 'zh',
    'eng': 'en',
    'jpn': 'ja',
    'kor': 'ko',
    'fra': 'fr',
    'deu': 'de',
    'spa': 'es',
    'ita': 'it',
    'rus': 'ru',
    'ara': 'ar',
    'por': 'pt'
  };
  return codeMap[lang.toLowerCase()] || null;
};

const isSameLang = (lang1: string, lang2: string): boolean => {
  return lang1.split('-')[0] === lang2.split('-')[0];
};

const isValidLang = (lang: string): boolean => {
  // 简单的语言代码验证
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(lang);
};

const inferLangFromScript = (text: string, fallback: string): string => {
  // 检测中文
  if (/[\u4e00-\u9fff]/.test(text)) {
    return 'zh-CN';
  }
  // 检测日文
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return 'ja';
  }
  // 检测韩文
  if (/[\uac00-\ud7af]/.test(text)) {
    return 'ko';
  }
  // 检测阿拉伯文
  if (/[\u0600-\u06ff]/.test(text)) {
    return 'ar';
  }
  // 检测西里尔字母（俄文等）
  if (/[\u0400-\u04ff]/.test(text)) {
    return 'ru';
  }
  return fallback;
};

// 文本清理函数
const cleanTextContent = (text: string) =>
  text.replace(/\r\n/g, '  ').replace(/\r/g, ' ').replace(/\n/g, ' ').trimStart();

// SSML生成函数（基于readest）
export const genSSML = (lang: string, text: string, voice: string, rate: number) => {
  const cleanedText = text.replace(/^<break\b[^>]*>/i, '');
  return `
    <speak version="1.0" xml:lang="${lang}">
      <voice name="${voice}">
        <prosody rate="${rate}" >
            ${cleanedText}
        </prosody>
      </voice>
    </speak>
  `;
};

// SSML语言解析（完全基于readest）
export const parseSSMLLang = (ssml: string, primaryLang?: string): string => {
  let lang = 'en';
  const match = ssml.match(/xml:lang\s*=\s*"([^"]+)"/);
  if (match && match[1]) {
    const parts = match[1].split('-');
    lang =
      parts.length > 1
        ? `${parts[0]!.toLowerCase()}-${parts[1]!.toUpperCase()}`
        : parts[0]!.toLowerCase();

    lang = code6392to6391(lang) || lang;
    if (!isValidLang(lang)) {
      lang = 'en';
    }
  }
  primaryLang = code6392to6391(primaryLang?.toLowerCase() || '') || primaryLang;
  if (lang === 'en' && primaryLang && !isSameLang(lang, primaryLang)) {
    lang = primaryLang.split('-')[0]!.toLowerCase();
  }
  return inferLangFromScript(ssml, lang);
};

// SSML标记解析（完全基于readest）
export const parseSSMLMarks = (ssml: string, primaryLang?: string) => {
  const defaultLang = parseSSMLLang(ssml, primaryLang) || 'en';
  ssml = ssml.replace(/<speak[^>]*>/i, '').replace(/<\/speak>/i, '');

  let plainText = '';
  const marks: TTSMark[] = [];

  let activeMark: string | null = null;
  let currentLang = defaultLang;
  const langStack: string[] = [];

  const tagRegex = /<(\/?)(\w+)([^>]*)>|([^<]+)/g;

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(ssml)) !== null) {
    if (match[4]) {
      const rawText = match[4];
      const text = cleanTextContent(rawText);
      if (text && activeMark) {
        const offset = plainText.length;
        plainText += text;
        marks.push({
          offset,
          name: activeMark,
          text,
          language: inferLangFromScript(text, currentLang) || currentLang,
        });
      } else {
        plainText += cleanTextContent(rawText);
      }
    } else {
      const isEnd = match[1] === '/';
      const tagName = match[2];
      const attr = match[3];

      if (tagName === 'mark' && !isEnd) {
        const nameMatch = attr?.match(/name="([^"]+)"/);
        if (nameMatch) {
          activeMark = nameMatch[1]!;
        }
      } else if (tagName === 'lang') {
        if (!isEnd) {
          langStack.push(currentLang);
          const langMatch = attr?.match(/xml:lang="([^"]+)"/);
          if (langMatch) {
            currentLang = langMatch[1]!;
          }
        } else {
          currentLang = langStack.pop() ?? defaultLang;
        }
      }
    }
  }

  return { plainText, marks };
};

// 查找SSML标记函数（基于readest）
export const findSSMLMark = (charIndex: number, marks: TTSMark[]) => {
  let left = 0;
  let right = marks.length - 1;
  let result: TTSMark | null = null;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const mark = marks[mid]!;

    if (mark.offset <= charIndex) {
      result = mark;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
};

// TTS工具类（基于readest的TTSUtils）
export class TTSUtils {
  private static readonly LOCAL_STORAGE_KEY = 'ttsPreferredVoices';
  private static readonly PREFERRED_CLIENT_KEY = 'preferredClient';

  private static normalizeLanguage(language: string): string {
    if (!language) return 'n/a';
    return language.toLowerCase().slice(0, 2);
  }

  static setPreferredClient(engine: string): void {
    if (!engine) return;
    const preferences = this.getPreferences();
    preferences[this.PREFERRED_CLIENT_KEY] = engine;
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
  }

  static setPreferredVoice(engine: string, language: string, voiceId: string): void {
    if (!engine || !language || !voiceId) return;
    const preferences = this.getPreferences();
    const lang = this.normalizeLanguage(language);
    preferences[`${engine}-${lang}`] = voiceId;
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
  }

  static getPreferredClient(): string | null {
    const preferences = this.getPreferences();
    return preferences[this.PREFERRED_CLIENT_KEY] || null;
  }

  static getPreferredVoice(engine: string, language: string): string | null {
    const preferences = this.getPreferences();
    const lang = this.normalizeLanguage(language);
    return preferences[`${engine}-${lang}`] || null;
  }

  private static getPreferences(): Record<string, string> {
    const storedPreferences = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    return storedPreferences ? JSON.parse(storedPreferences) : {};
  }

  // 语音排序函数（基于readest的逻辑）
  static sortVoicesFunc(a: TTSVoice, b: TTSVoice): number {
    const aRegion = a.lang.split('-')[1] || '';
    const bRegion = b.lang.split('-')[1] || '';
    if (aRegion === bRegion) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    }
    if (aRegion === 'CN') return -1;
    if (bRegion === 'CN') return 1;
    if (aRegion === 'TW') return -1;
    if (bRegion === 'TW') return 1;
    if (aRegion === 'HK') return -1;
    if (bRegion === 'HK') return 1;
    if (aRegion === 'US') return -1;
    if (bRegion === 'US') return 1;
    if (aRegion === 'GB') return -1;
    if (bRegion === 'GB') return 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  }

  // 音频解锁函数（移动端）
  static unblockAudio(): void {
    if (typeof window !== 'undefined') {
      // 创建一个静音音频来解锁
      const silence = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0.01; // 很小的音量
        oscillator.frequency.value = 440;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      };
      
      try {
        silence();
      } catch (error) {
        console.log('Audio unlock failed:', error);
      }
      
      // 尝试触发一个静音的speech synthesis来解锁
      try {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(' ');
        utterance.volume = 0.01;
        synth.speak(utterance);
        setTimeout(() => synth.cancel(), 100);
      } catch (error) {
        console.log('Speech synthesis unlock failed:', error);
      }
    }
  }
}