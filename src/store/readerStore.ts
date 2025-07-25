import { create } from 'zustand';
import { FoliateView } from '@/types/view';
import { ViewSettings, TOCItem, Location } from '@/types/book';

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

export const useReaderStore = create<ReaderState>((set, get) => ({
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
  },

  getViewSettings: (bookKey: string) => {
    return get().viewSettings[bookKey] || null;
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
})); 