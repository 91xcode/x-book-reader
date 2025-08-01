import { BookDoc } from '@/libs/document';
import { BookNote, BookSearchConfig, BookSearchResult } from '@/types/book';

export interface FoliateView extends HTMLElement {
  open: (book: BookDoc) => Promise<void>;
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
  addAnnotation: (note: BookNote, remove?: boolean) => { index: number; label: string };
  search: (config: BookSearchConfig) => AsyncGenerator<BookSearchResult | string, void, void>;
  clearSearch: () => void;
  select: (target: string | number | { fraction: number }) => void;
  deselect: () => void;
  initTTS: (
    granularity?: 'sentence' | 'word',
    nodeFilter?: (node: Node) => number,
    highlight?: (range: Range) => void,
  ) => Promise<void>;
  book: BookDoc;
  tts: any | null;
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
    size: number; // current page height
    viewSize: number; // whole document view height
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

export const wrappedFoliateView = (originalView: FoliateView): FoliateView => {
  const originalAddAnnotation = originalView.addAnnotation.bind(originalView);
  originalView.addAnnotation = (note: BookNote, remove = false) => {
    // transform BookNote to foliate annotation
    const annotation = {
      value: note.cfi,
      ...note,
    };
    return originalAddAnnotation(annotation, remove);
  };

  // 添加安全保护机制，防止document为null的错误
  const originalGoToFraction = originalView.goToFraction?.bind(originalView);
  if (originalGoToFraction) {
    originalView.goToFraction = (fraction: number) => {
      try {
        if (!originalView.renderer || !originalView.book) {
          console.warn('Renderer or book not ready, delaying goToFraction');
          setTimeout(() => {
            if (originalView.renderer && originalView.book) {
              originalGoToFraction(fraction);
            }
          }, 100);
          return;
        }
        originalGoToFraction(fraction);
      } catch (error) {
        console.error('Error in goToFraction:', error);
        // 尝试延迟执行
        setTimeout(() => {
          try {
            originalGoToFraction(fraction);
          } catch (retryError) {
            console.error('Retry goToFraction failed:', retryError);
          }
        }, 200);
      }
    };
  }

  const originalInit = originalView.init?.bind(originalView);
  if (originalInit) {
    originalView.init = (options: { lastLocation: string }) => {
      try {
        if (!originalView.renderer || !originalView.book) {
          console.warn('Renderer or book not ready, delaying init');
          setTimeout(() => {
            if (originalView.renderer && originalView.book) {
              originalInit(options);
            }
          }, 100);
          return;
        }
        originalInit(options);
      } catch (error) {
        console.error('Error in init:', error);
        // 尝试延迟执行
        setTimeout(() => {
          try {
            originalInit(options);
          } catch (retryError) {
            console.error('Retry init failed:', retryError);
          }
        }, 200);
      }
    };
  }

  return originalView;
}; 