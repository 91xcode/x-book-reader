// TTS相关的类型定义 - 100%基于readest项目架构

// 基础TTS类型（完全匹配readest）
export type TTSGranularity = 'sentence' | 'word';

export type TTSHighlightOptions = {
  style: 'highlight' | 'underline' | 'squiggly' | 'outline';
  color: string;
};

export type TTSVoice = {
  id: string;
  name: string;
  lang: string;
  disabled?: boolean;
};

export type TTSVoicesGroup = {
  id: string;
  name: string;
  voices: TTSVoice[];
  disabled?: boolean;
};

export type TTSMark = {
  offset: number;
  name: string;
  text: string;
  language: string;
};

// TTS消息事件（完全匹配readest）
type TTSMessageCode = 'boundary' | 'error' | 'end';

export interface TTSMessageEvent {
  code: TTSMessageCode;
  message?: string;
  mark?: string;
}

// TTS状态类型（完全匹配readest）
export type TTSState =
  | 'stopped'
  | 'playing'
  | 'paused'
  | 'stop-paused'
  | 'backward-paused'
  | 'forward-paused'
  | 'setrate-paused'
  | 'setvoice-paused';

// TTS客户端接口（完全匹配readest）
export interface TTSClient {
  name: string;
  initialized: boolean;
  init(): Promise<boolean>;
  shutdown(): Promise<void>;
  speak(ssml: string, signal: AbortSignal, preload?: boolean): AsyncIterable<TTSMessageEvent>;
  pause(): Promise<boolean>;
  resume(): Promise<boolean>;
  stop(): Promise<void>;
  setPrimaryLang(lang: string): void;
  setRate(rate: number): Promise<void>;
  setPitch(pitch: number): Promise<void>;
  setVoice(voice: string): Promise<void>;
  getAllVoices(): Promise<TTSVoice[]>;
  getVoices(lang: string): Promise<TTSVoicesGroup[]>;
  getGranularities(): TTSGranularity[];
  getVoiceId(): string;
  getSpeakingLang(): string;
}

// 应用服务接口（简化版）
export interface AppService {
  isAndroidApp?: boolean;
  isIOSApp?: boolean;
  isMobile?: boolean;
  isMobileApp?: boolean;
}

// Foliate视图接口（基于readest的FoliateView）
export interface FoliateView extends HTMLElement {
  open: (book: any) => Promise<void>;
  close: () => void;
  init: (options: { lastLocation: string }) => void;
  goTo: (href: string) => void;
  goToFraction: (fraction: number) => void;
  prev: (distance?: number) => void;
  next: (distance?: number) => void;
  goLeft: () => void;
  goRight: () => void;
  getCFI: (index: number, range: Range) => string;
  resolveCFI: (cfi: string) => { index: number; anchor: (doc: Document) => Range };
  addAnnotation: (note: any, remove?: boolean) => { index: number; label: string };
  search: (config: any) => AsyncGenerator<any, void, void>;
  clearSearch: () => void;
  select: (target: string | number | { fraction: number }) => void;
  deselect: () => void;
  initTTS: (
    granularity?: TTSGranularity,
    nodeFilter?: (node: Node) => number,
    highlight?: (range: Range) => void,
  ) => Promise<void>;
  book: any;
  tts: {
    start(): string;
    resume(): string;
    from(range?: Range): string;
    next(paused?: boolean): string;
    prev(paused?: boolean): string;
    setMark(mark: string): Range | null;
  } | null;
  language: {
    locale?: string;
    isCJK?: boolean;
  };
  history: {
    canGoBack: boolean;
    canGoForward: boolean;
    back: () => void;
    forward: () => void;
    clear: () => void;
  };
  renderer: {
    scrolled?: boolean;
    size: number;
    viewSize: number;
    start: number;
    end: number;
    page: number;
    pages: number;
    containerPosition: number;
    sideProp: 'width' | 'height';
    setAttribute: (name: string, value: string | number) => void;
    removeAttribute: (name: string) => void;
    next: () => Promise<void>;
    prev: () => Promise<void>;
    nextSection?: () => Promise<void>;
    prevSection?: () => Promise<void>;
    goTo?: (params: { index: number; anchor: number }) => void;
    setStyles?: (css: string) => void;
    getContents: () => { doc: Document; index?: number; overlayer?: unknown }[];
    scrollToAnchor: (anchor: number | Range) => void;
    addEventListener: (
      type: string,
      listener: EventListener,
      option?: AddEventListenerOptions,
    ) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
  };
}

// Edge TTS专用类型
export interface EdgeTTSPayload {
  lang: string;
  text: string;
  voice: string;
  rate: number;
  pitch: number;
}