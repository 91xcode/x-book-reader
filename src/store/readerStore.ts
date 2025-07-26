import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FoliateView } from '@/types/view';
import { ViewSettings, TOCItem, Location } from '@/types/book';
import { DEFAULT_VIEW_SETTINGS } from '@/utils/constants';
import { getCompleteStyles } from '@/utils/style';

interface Progress {
  cfi?: string;
  tocItem?: TOCItem;
  section?: any;
  location?: Location;
  time?: number;
  range?: Range;
  sectionHref?: string;
}

interface ReaderState {
  // 视图管理
  views: Record<string, FoliateView | null>;
  
  // 视图设置
  viewSettings: Record<string, ViewSettings>;
  
  // 进度管理
  progress: Record<string, Progress>;
  
  // 书籍键列表
  bookKeys: string[];
  
  // Actions
  setView: (bookKey: string, view: FoliateView | null) => void;
  getView: (bookKey: string) => FoliateView | null;
  getViewsById: (bookId: string) => (FoliateView | null)[];
  
  setViewSettings: (bookKey: string, settings: ViewSettings) => void;
  getViewSettings: (bookKey: string) => ViewSettings | null;
  initializeViewSettings: (bookKey: string) => void;
  applyViewStyles: (bookKey: string) => void;
  
  setProgress: (
    bookKey: string,
    cfi?: string,
    tocItem?: TOCItem,
    section?: any,
    location?: Location,
    time?: number,
    range?: Range,
  ) => void;
  getProgress: (bookKey: string) => Progress | null;
  
  addBookKey: (bookKey: string) => void;
  removeBookKey: (bookKey: string) => void;
  clearBookKeys: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
  views: {},
  viewSettings: {},
  progress: {},
  bookKeys: [],

  setView: (bookKey: string, view: FoliateView | null) => {
    set((state) => ({
      views: {
        ...state.views,
        [bookKey]: view,
      },
    }));
  },

  getView: (bookKey: string) => {
    return get().views[bookKey] || null;
  },

  getViewsById: (bookId: string) => {
    const state = get();
    return state.bookKeys
      .filter(key => key.startsWith(bookId))
      .map(key => state.views[key] || null);
  },

  setViewSettings: (bookKey: string, settings: ViewSettings) => {
    set((state) => ({
      viewSettings: {
        ...state.viewSettings,
        [bookKey]: settings,
      },
    }));
    
    // Apply styles immediately after setting (debounced to prevent infinite loops)
    const timeoutId = setTimeout(() => {
      get().applyViewStyles(bookKey);
    }, 50);
    
    // Store timeout to allow cleanup if needed
    (globalThis as any).__styleApplyTimeout = timeoutId;
  },

  getViewSettings: (bookKey: string) => {
    return get().viewSettings[bookKey] || null;
  },

  initializeViewSettings: (bookKey: string) => {
    const currentSettings = get().viewSettings[bookKey];
    if (!currentSettings) {
      set((state) => ({
        viewSettings: {
          ...state.viewSettings,
          [bookKey]: { ...DEFAULT_VIEW_SETTINGS },
        },
      }));
    }
  },

  applyViewStyles: (bookKey: string) => {
    const state = get();
    const view = state.views[bookKey];
    const settings = state.viewSettings[bookKey];
    
    if (!view || !settings) return;
    
    try {
      // Apply styles - will be handled by view events or direct CSS injection
      const styles = getCompleteStyles(settings);
      
      // Store styles for later application when docs are loaded
      (view as any)._pendingStyles = styles;
      
      // Apply layout properties to renderer
      if (view.renderer) {
        const { renderer } = view;
        
        // Apply margins
        renderer.setAttribute('margin-top', `${settings.marginTopPx}px`);
        renderer.setAttribute('margin-bottom', `${settings.marginBottomPx}px`);
        renderer.setAttribute('margin-left', `${settings.marginLeftPx}px`);
        renderer.setAttribute('margin-right', `${settings.marginRightPx}px`);
        
        // Apply gap
        renderer.setAttribute('gap', `${settings.gapPercent}%`);
        
        // Apply column settings
        renderer.setAttribute('max-column-count', settings.maxColumnCount.toString());
        renderer.setAttribute('max-inline-size', `${settings.maxInlineSize}px`);
        renderer.setAttribute('max-block-size', `${settings.maxBlockSize}px`);
        
        // Apply flow mode
        renderer.setAttribute('flow', settings.scrolled ? 'scrolled' : 'paginated');
        
        // Apply writing mode
        if (settings.writingMode !== 'auto') {
          renderer.setAttribute('writing-mode', settings.writingMode);
        }
        
        // Apply animation
        renderer.setAttribute('animated', settings.animated.toString());
      }
    } catch (error) {
      console.error('Failed to apply view styles:', error);
    }
  },

  setProgress: (
    bookKey: string,
    cfi?: string,
    tocItem?: TOCItem,
    section?: any,
    location?: Location,
    time?: number,
    range?: Range,
  ) => {
    set((state) => ({
      progress: {
        ...state.progress,
        [bookKey]: {
          cfi,
          tocItem,
          section,
          location,
          time: time || Date.now(),
          range,
          sectionHref: tocItem?.href,
        },
      },
    }));
  },

  getProgress: (bookKey: string) => {
    return get().progress[bookKey] || null;
  },

  addBookKey: (bookKey: string) => {
    set((state) => ({
      bookKeys: state.bookKeys.includes(bookKey) 
        ? state.bookKeys 
        : [...state.bookKeys, bookKey],
    }));
  },

  removeBookKey: (bookKey: string) => {
    set((state) => ({
      bookKeys: state.bookKeys.filter(key => key !== bookKey),
      views: Object.fromEntries(
        Object.entries(state.views).filter(([key]) => key !== bookKey)
      ),
      viewSettings: Object.fromEntries(
        Object.entries(state.viewSettings).filter(([key]) => key !== bookKey)
      ),
      progress: Object.fromEntries(
        Object.entries(state.progress).filter(([key]) => key !== bookKey)
      ),
    }));
  },

      clearBookKeys: () => {
      set({
        bookKeys: [],
        views: {},
        viewSettings: {},
        progress: {},
      });
    },
  }),
  {
    name: 'reader-store',
    partialize: (state) => ({
      viewSettings: state.viewSettings,
      progress: state.progress,
    }),
    // Skip hydration to prevent initial render issues
    skipHydration: true,
  }
  )
);  