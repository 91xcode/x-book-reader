import { TTSClient, TTSVoice, TTSGranularity, TTSHighlightOptions, TTSMark, AppService, FoliateView } from '@/types/tts';
import { parseSSMLMarks, parseSSMLLang, TTSUtils } from './utils';
import { EdgeTTSClient } from './LobeTTSClient';
import { Overlayer } from 'foliate-js/overlayer.js';

// 添加node过滤器功能（基于readest）
const createRejecttFilter = (options: {
  tags?: string[];
  contents?: { tag: string; content: RegExp }[];
}) => {
  return (node: Node): number => {
    if (node.nodeType === 3) return 1; // 文本节点通过
    if (node.nodeType !== 1) return 3; // 其他节点跳过
    
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    
    // 过滤指定标签
    if (options.tags?.includes(tagName)) {
      return 3; // 拒绝
    }
    
    // 过滤指定内容
    if (options.contents) {
      for (const { tag, content } of options.contents) {
        if (tagName === tag && content.test(element.textContent || '')) {
          return 3; // 拒绝
        }
      }
    }
    
    return 1; // 接受
  };
};

type TTSState =
  | 'stopped'
  | 'playing'
  | 'paused'
  | 'stop-paused'
  | 'backward-paused'
  | 'forward-paused'
  | 'setrate-paused'
  | 'setvoice-paused';

const HIGHLIGHT_KEY = 'tts-highlight';

export class TTSController extends EventTarget {
  appService: AppService | null = null;
  view: FoliateView;
  #nossmlCnt: number = 0;
  #currentSpeakAbortController: AbortController | null = null;
  #currentSpeakPromise: Promise<void> | null = null;

  state: TTSState = 'stopped';
  ttsLang: string = '';
  ttsRate: number = 1.0;
  ttsClient: TTSClient;
  ttsEdgeClient: TTSClient;
  ttsEdgeVoices: TTSVoice[] = [];

  constructor(appService: AppService | null, view: FoliateView) {
    super();
    this.ttsEdgeClient = new EdgeTTSClient(this);
    this.ttsClient = this.ttsEdgeClient;
    this.appService = appService;
    this.view = view;
  }

  async init() {
    const availableClients = [];
    if (await this.ttsEdgeClient.init()) {
      availableClients.push(this.ttsEdgeClient);
    }
    this.ttsClient = availableClients[0] || this.ttsEdgeClient;
    const preferredClientName = TTSUtils.getPreferredClient();
    if (preferredClientName) {
      const preferredClient = availableClients.find(
        (client) => client.name === preferredClientName,
      );
      if (preferredClient) {
        this.ttsClient = preferredClient;
      }
    }
    this.ttsEdgeVoices = await this.ttsEdgeClient.getAllVoices();
  }

  #getHighlighter(options: TTSHighlightOptions) {
    return (range: Range) => {
      const { overlayer } = this.view.renderer.getContents()[0] as { overlayer: Overlayer };
      const { style, color } = options;
      overlayer?.remove(HIGHLIGHT_KEY);
      overlayer?.add(HIGHLIGHT_KEY, range, Overlayer[style], { color });
      const rect = range.getBoundingClientRect();
      const { start, size, viewSize, sideProp } = this.view.renderer;
      const position = rect[sideProp === 'height' ? 'y' : 'x'] + 88;
      const offset = this.view.book.dir === 'rtl' ? viewSize - position : position;
      if (!this.view.renderer.scrolled || offset < start || offset > start + size) {
        this.view.renderer.scrollToAnchor(range);
      }
    };
  }

  #clearHighlighter() {
    const { overlayer } = (this.view.renderer.getContents()?.[0] || {}) as { overlayer?: Overlayer };
    overlayer?.remove(HIGHLIGHT_KEY);
  }

  async initViewTTS() {
    let granularity: TTSGranularity = this.view.language.isCJK ? 'sentence' : 'word';
    const supportedGranularities = this.ttsClient.getGranularities();
    if (!supportedGranularities.includes(granularity)) {
      granularity = supportedGranularities[0]!;
    }
    const highlightOptions: TTSHighlightOptions = { style: 'highlight', color: '#ffeb3b' };
    await this.view.initTTS(
      granularity,
      createRejecttFilter({
        tags: ['rt', 'sup'],
        contents: [{ tag: 'a', content: /^\d+$/ }],
      }),
      this.#getHighlighter(highlightOptions),
    );
  }

  async preloadSSML(ssml: string | undefined) {
    if (!ssml) return;
    const iter = await this.ttsClient.speak(ssml, new AbortController().signal, true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of iter);
  }

  async preloadNextSSML(count: number = 2) {
    const tts = this.view.tts;
    if (!tts) return;
    let preloaded = 0;
    for (let i = 0; i < count; i++) {
      const ssml = this.#preprocessSSML(tts.next());
      this.preloadSSML(ssml);
      if (ssml) preloaded++;
    }
    for (let i = 0; i < preloaded; i++) {
      tts.prev();
    }
  }

  #preprocessSSML(ssml?: string) {
    if (!ssml) return;
    ssml = ssml
      .replace(/<emphasis[^>]*>([^<]+)<\/emphasis>/g, '$1')
      .replace(/[–—]/g, ',')
      .replace('<break/>', ' ')
      .replace(/\.{3,}/g, '   ')
      .replace(/……/g, '  ')
      .replace(/\*/g, ' ')
      .replace(/·/g, ' ');

    return ssml;
  }
  async #speak(ssml: string | undefined | Promise<string>) {
    await this.stop();
    this.#currentSpeakAbortController = new AbortController();
    const { signal } = this.#currentSpeakAbortController;

    this.#currentSpeakPromise = new Promise(async (resolve, reject) => {
      try {
        this.state = 'playing';
        ssml = this.#preprocessSSML(await ssml);
        await this.preloadSSML(ssml);
        if (!ssml) {
          this.#nossmlCnt++;
          // FIXME: in case we are at the end of the book, need a better way to handle this
          if (this.#nossmlCnt < 10 && this.state === 'playing') {
            resolve();
            await this.view.next();
            await this.forward();
          }
          console.log('no SSML, skipping for', this.#nossmlCnt);
          return;
        } else {
          this.#nossmlCnt = 0;
        }

        const { plainText, marks } = parseSSMLMarks(ssml);
        if (!plainText || marks.length === 0) {
          resolve();
          return await this.forward();
        }
        const iter = await this.ttsClient.speak(ssml, signal);
        let lastCode;
        for await (const { code, mark } of iter) {
          if (signal.aborted) {
            resolve();
            return;
          }
          if (mark && this.state === 'playing') {
            const range = this.view.tts?.setMark(mark);
            this.dispatchEvent(new CustomEvent('tts-highlight-mark', { detail: range }));
          }
          lastCode = code;
        }

        if (lastCode === 'end' && this.state === 'playing') {
          resolve();
          await this.forward();
        }
        resolve();
      } catch (e) {
        if (signal.aborted) {
          resolve();
        } else {
          reject(e);
        }
      } finally {
        this.#currentSpeakAbortController = null;
        this.#currentSpeakPromise = null;
      }
    });
    await this.#currentSpeakPromise.catch((e) => this.error(e));
  }
  async speak(ssml: string | Promise<string>) {
    await this.initViewTTS();
    this.#speak(ssml);
  }

  async start() {
    await this.initViewTTS();
    let ssml: string | undefined;
    
    if (this.state.includes('paused')) {
      ssml = this.view.tts?.resume();
    } else {
      ssml = this.view.tts?.start();
    }
    
    this.#speak(ssml);
    this.preloadNextSSML();
  }
  async pause() {
    this.state = 'paused';
    await this.ttsClient.pause();
  }

  async resume() {
    this.state = 'playing';
    await this.ttsClient.resume();
  }
  async stop() {
    if (this.#currentSpeakAbortController) {
      this.#currentSpeakAbortController.abort();
    }
    await this.ttsClient.stop().catch((e) => this.error(e));

    if (this.#currentSpeakPromise) {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Stop operation timed out')), 3000),
      );
      await Promise.race([this.#currentSpeakPromise.catch((e) => this.error(e)), timeout]).catch(
        (e) => this.error(e),
      );
      this.#currentSpeakPromise = null;
    }
    this.state = 'stopped';
    // 停止时清除高亮
    this.#clearHighlighter();
  }

  async forward() {
    this.state = 'forward-paused';
    const ssml = this.view.tts?.next();
    this.#speak(ssml);
    this.preloadNextSSML();
  }

  async backward() {
    this.state = 'backward-paused';
    const ssml = this.view.tts?.prev();
    this.#speak(ssml);
    this.preloadNextSSML();
  }

  async setLang(lang: string) {
    this.ttsLang = lang;
    this.setPrimaryLang(lang);
  }

  async setPrimaryLang(lang: string) {
    if (this.ttsEdgeClient.initialized) this.ttsEdgeClient.setPrimaryLang(lang);
  }

  async setRate(rate: number) {
    this.state = 'setrate-paused';
    this.ttsRate = rate;
    await this.ttsClient.setRate(this.ttsRate);
  }

  async getVoices(lang: string) {
    const ttsEdgeVoices = await this.ttsEdgeClient.getVoices(lang);
    const voicesGroups = [...ttsEdgeVoices];
    return voicesGroups;
  }

  async setVoice(voiceId: string, lang: string) {
    this.state = 'setvoice-paused';
    const useEdgeTTS = !!this.ttsEdgeVoices.find(
      (voice) => (voiceId === '' || voice.id === voiceId) && !voice.disabled,
    );
    if (useEdgeTTS) {
      this.ttsClient = this.ttsEdgeClient;
      await this.ttsClient.setRate(this.ttsRate);
    }
    TTSUtils.setPreferredClient(this.ttsClient.name);
    TTSUtils.setPreferredVoice(this.ttsClient.name, lang, voiceId);
    await this.ttsClient.setVoice(voiceId);
  }

  getVoiceId() {
    return this.ttsClient.getVoiceId();
  }

  getSpeakingLang() {
    return this.ttsClient.getSpeakingLang();
  }

  dispatchSpeakMark(mark: TTSMark) {
    this.dispatchEvent(new CustomEvent('tts-speak-mark', { detail: mark }));
  }

  error(e: unknown) {
    console.error(e);
    this.state = 'stopped';
  }

  async shutdown() {
    await this.stop();
    this.#clearHighlighter();
    if (this.ttsEdgeClient.initialized) {
      await this.ttsEdgeClient.shutdown();
    }
  }
}