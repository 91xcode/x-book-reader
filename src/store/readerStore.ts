import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FoliateView } from '@/types/view';
import { ViewSettings, TOCItem, Location, Book, BookDoc, PageInfo, TimeInfo } from '@/types/book';
import { DEFAULT_VIEW_SETTINGS } from '@/utils/constants';
import { getCompleteStyles } from '@/utils/style';
import { useBookDataStore } from './bookDataStore';
import { BookServiceV2 } from '@/services/BookServiceV2';
import { DocumentLoader } from '@/libs/document';

interface Progress {
  cfi?: string;
  tocItem?: TOCItem;
  location?: Location;
  time?: number;
  range?: Range;
  sectionHref?: string;
  sectionLabel?: string;
  sectionId?: number;
  section?: PageInfo;
  pageinfo?: PageInfo;
  timeinfo?: TimeInfo;
}

interface ViewState {
  key: string;
  view: FoliateView | null;
  isPrimary: boolean;
  loading: boolean;
  error: string | null;
  progress: Progress | null;
  ribbonVisible: boolean;
  ttsEnabled: boolean;
  gridInsets: any | null;
  viewSettings: ViewSettings | null;
}

interface ReaderState {
  // 视图管理
  views: Record<string, FoliateView | null>;
  viewStates: Record<string, ViewState>;
  
  // 视图设置
  viewSettings: Record<string, ViewSettings>;
  
  // 进度管理
  progress: Record<string, Progress>;
  
  // 工具栏状态 - readest风格
  hoveredBookKey: string | null;
  
  // 书籍键列表
  bookKeys: string[];
  
  // Actions
  setView: (bookKey: string, view: FoliateView | null) => void;
  getView: (bookKey: string) => FoliateView | null;
  
  // 工具栏状态管理 - readest风格
  setHoveredBookKey: (bookKey: string | null) => void;
  getHoveredBookKey: () => string | null;
  getViewsById: (bookId: string) => (FoliateView | null)[];
  
  setViewSettings: (bookKey: string, settings: ViewSettings) => void;
  getViewSettings: (bookKey: string) => ViewSettings | null;
  initializeViewSettings: (bookKey: string) => void;
  applyViewStyles: (bookKey: string) => void;
  
  setProgress: (
    bookKey: string,
    cfi?: string,
    tocItem?: TOCItem,
    section?: PageInfo,
    pageinfo?: PageInfo,
    timeinfo?: TimeInfo,
    location?: Location,
    time?: number,
    range?: Range,
  ) => void;
  getProgress: (bookKey: string) => Progress | null;
  
  addBookKey: (bookKey: string) => void;
  removeBookKey: (bookKey: string) => void;
  clearBookKeys: () => void;

  // New methods to match readest
  setBookKeys: (keys: string[]) => void;
  getViewState: (key: string) => ViewState | null;
  initViewState: (id: string, key: string, isPrimary?: boolean) => Promise<void>;
  clearViewState: (key: string) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
  views: {},
  viewStates: {},
  
  // 工具栏状态 - readest风格  
  hoveredBookKey: null,
  viewSettings: {},
  progress: {},
  bookKeys: [],

  setView: (bookKey: string, view: FoliateView | null) => {
    set((state) => ({
      views: {
        ...state.views,
        [bookKey]: view,
      },
      viewStates: {
        ...state.viewStates,
        [bookKey]: {
          ...state.viewStates[bookKey],
          view,
        },
      },
    }));
  },

  getView: (bookKey: string) => {
    return get().views[bookKey] || null;
  },

  // 🎯 工具栏状态管理 - readest风格
  setHoveredBookKey: (bookKey: string | null) => {
    set({ hoveredBookKey: bookKey });
  },

  getHoveredBookKey: () => {
    return get().hoveredBookKey;
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
    
    console.log('📚 Store: 更新viewSettings', {
      bookKey,
      fontSize: settings.defaultFontSize,
      overrideFont: settings.overrideFont
    });
  },

  getViewSettings: (bookKey: string) => {
    return get().viewSettings[bookKey] || null;
  },

  initializeViewSettings: (bookKey: string) => {
    const currentSettings = get().viewSettings[bookKey];
    if (!currentSettings) {
      // 获取全局设置 - 直接从DEFAULT_VIEW_SETTINGS构建，避免循环依赖
      const globalViewSettings = {}; // 暂时为空对象，后续可以通过参数传入
      
      // 与readest完全一致的合并逻辑
      const isCJKEnv = () => {
        if (typeof window === 'undefined') return false;
        const lang = navigator.language || 'en';
        return ['zh', 'ja', 'ko'].some(l => lang.startsWith(l));
      };
      
      const mergedSettings = {
        ...DEFAULT_VIEW_SETTINGS,
        ...(isCJKEnv() ? { fullJustification: true, textIndent: 2 } : {}), // CJK环境特殊处理
        ...globalViewSettings
      };
      
      console.log('🔧 初始化viewSettings:', {
        isCJK: isCJKEnv(),
        textIndent: mergedSettings.textIndent,
        overrideLayout: mergedSettings.overrideLayout,
        fullSettings: mergedSettings
      });
      
      set((state) => ({
        viewSettings: {
          ...state.viewSettings,
          [bookKey]: mergedSettings,
        },
      }));
      
      // 立即应用样式
      const view = get().views[bookKey];
      if (view?.renderer?.setStyles) {
        view.renderer.setStyles(getCompleteStyles(mergedSettings));
      }
    }
  },

  applyViewStyles: (bookKey: string) => {
    const state = get();
    const view = state.views[bookKey];
    const settings = state.viewSettings[bookKey];
    
    if (!view || !settings) return;
    
    try {
      // Apply styles - 关键修复：实际应用样式到iframe
      const styles = getCompleteStyles(settings);
      
      console.log('🎨 Store: 应用样式到iframe', {
        bookKey,
        stylesLength: styles.length,
        fontSize: settings.defaultFontSize,
        overrideFont: settings.overrideFont
      });
      
      // 实际应用样式到iframe
      if (view.renderer?.setStyles) {
        view.renderer.setStyles(styles);
        console.log('✅ Store: 样式已成功应用到iframe');
      } else {
        // Store styles for later application when docs are loaded
        (view as any)._pendingStyles = styles;
        console.log('📝 Store: 样式已暂存，等待iframe准备就绪');
      }
      
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
        
        // 🎯 Apply animation - readest风格
        if (settings.animated) {
          renderer.setAttribute('animated', '');
        } else {
          renderer.removeAttribute('animated');
        }
      }
    } catch (error) {
      console.error('Failed to apply view styles:', error);
    }
  },

  setProgress: (
    bookKey: string,
    cfi?: string,
    tocItem?: TOCItem,
    section?: PageInfo,
    pageinfo?: PageInfo,
    timeinfo?: TimeInfo,
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
          pageinfo,
          timeinfo,
          location,
          time: time || Date.now(),
          range,
          sectionHref: tocItem?.href,
          sectionLabel: tocItem?.label,
          sectionId: tocItem?.id,
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

  // New methods to match readest
  setBookKeys: (keys: string[]) => set({ bookKeys: keys }),

  getViewState: (key: string) => get().viewStates[key] || null,

  initViewState: async (id: string, key: string, isPrimary = true) => {
    const startTime = performance.now();
    console.log('🚀 ReaderStore: 初始化ViewState', { id, key, isPrimary });
    
    // 设置初始加载状态
    set((state) => ({
      viewStates: {
        ...state.viewStates,
        [key]: {
          key,
          view: null,
          isPrimary,
          loading: true,
          error: null,
          progress: null,
          ribbonVisible: false,
          ttsEnabled: false,
          gridInsets: null,
          viewSettings: null,
        },
      },
    }));

    try {
      const bookDataStore = useBookDataStore.getState();
      const bookService = BookServiceV2.getInstance();
      
      // 检查缓存中是否已有数据
      let bookData = bookDataStore.getBookData(id);
      
      if (!bookData?.bookDoc) {
        console.log('📚 Readest策略：缓存中没有BookDoc，开始延迟解析...');
        
        // 从bookService获取书籍元数据
        const book = bookService.getBookByHash(id);
        if (!book) {
          throw new Error('Book not found');
        }
        
        // 获取书籍文件
        const bookFile = await bookService.getBookFile(book.hash);
        if (!bookFile) {
          throw new Error('无法加载书籍文件');
        }
        
        // 检查缓存是否有效
        if (bookData && bookDataStore.isCacheValid(id, bookFile)) {
          console.log('✅ 使用有效缓存');
        } else {
          console.log('📖 解析书籍文档...');
          // 解析书籍文档
          const loader = new DocumentLoader(bookFile);
          const parsedDocument = await loader.open();
          
          if (!parsedDocument?.book) {
            throw new Error('无法解析书籍内容');
          }
          
          // 缓存解析后的数据
          bookDataStore.setBookData(id, {
            id,
            book,
            file: bookFile,
            config: null, // 配置将在需要时设置
            bookDoc: parsedDocument.book,
            fileLastModified: bookFile.lastModified,
          });
          
          bookData = bookDataStore.getBookData(id);
        }
      } else {
        console.log('🚀 使用缓存的书籍数据 - 快速加载模式 (SPA导航保持内存状态)');
      }
      
      if (!bookData?.bookDoc) {
        throw new Error('Failed to load book data');
      }
      
      // 初始化视图设置
      const currentSettings = get().viewSettings[key];
      if (!currentSettings) {
        get().initializeViewSettings(key);
      }
      
      // 更新ViewState为成功状态
      set((state) => ({
        viewStates: {
          ...state.viewStates,
          [key]: {
            ...state.viewStates[key]!,
            loading: false,
            error: null,
            viewSettings: state.viewSettings[key],
          },
        },
      }));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log('✅ ViewState初始化完成', { 
        key, 
        hasBookDoc: !!bookData.bookDoc,
        duration: `${duration.toFixed(2)}ms`,
        fromCache: !!bookData.bookDoc
      });
      
    } catch (error) {
      console.error('❌ ViewState初始化失败:', error);
      
      set((state) => ({
        viewStates: {
          ...state.viewStates,
          [key]: {
            ...state.viewStates[key]!,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load book.',
          },
        },
      }));
    }
  },

  clearViewState: (key: string) => {
    set((state) => {
      const viewStates = { ...state.viewStates };
      delete viewStates[key];
      return { viewStates };
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