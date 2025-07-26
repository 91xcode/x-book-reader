import { SystemSettings, ReadSettings } from '@/types/settings';
import { ViewSettings } from '@/types/book';

export const SYSTEM_SETTINGS_VERSION = 1;

export const DEFAULT_SYSTEM_SETTINGS: Partial<SystemSettings> = {
  version: SYSTEM_SETTINGS_VERSION,
  localBooksDir: '',
  keepLogin: false,
  autoUpload: false,
  alwaysOnTop: false,
  openBookInNewWindow: false,
  autoCheckUpdates: true,
  screenWakeLock: false,
  alwaysShowStatusBar: false,
  openLastBooks: true,
  lastOpenBooks: [],
  autoImportBooksOnOpen: false,
  telemetryEnabled: false,
  libraryViewMode: 'grid',
  librarySortBy: 'updated',
  librarySortAscending: false,
  libraryCoverFit: 'crop',
  lastSyncedAtBooks: 0,
  lastSyncedAtConfigs: 0,
  lastSyncedAtNotes: 0,
};

export const DEFAULT_READSETTINGS: ReadSettings = {
  sideBarWidth: '280px',
  isSideBarPinned: true,
  notebookWidth: '320px',
  isNotebookPinned: false,
  autohideCursor: false,
  translationProvider: 'google',
  translateTargetLang: 'en',
  highlightStyle: 'highlight',
  highlightStyles: {
    underline: '#3b82f6',
    highlight: '#fbbf24',
    strikethrough: '#ef4444',
  },
  customThemes: [],
};

// 字体常量配置 - 与readest项目一致

// 字体分类
export const SERIF_FONTS = [
  'Bitter',
  'Literata',
  'Merriweather', 
  'Vollkorn',
  'Georgia',
  'Times New Roman',
];

export const SANS_SERIF_FONTS = [
  'Roboto', 
  'Noto Sans',
  'Open Sans',
  'Helvetica'
];

export const MONOSPACE_FONTS = [
  'Fira Code',
  'Lucida Console',
  'Consolas', 
  'Courier New'
];

export const CJK_SERIF_FONTS = [
  'LXGW WenKai GB Screen',
  'LXGW WenKai TC',
  'GuanKiapTsingKhai-T',
  'Source Han Serif CN VF',
  'Huiwen-mincho',
  'KingHwa_OldSong',
];

export const CJK_SANS_SERIF_FONTS = [
  'Noto Sans SC',
  'Noto Sans TC'
];

export const FALLBACK_FONTS = ['MiSans L3'];

// 默认字体配置 - 与readest项目完全一致
export const DEFAULT_BOOK_FONT = {
  serifFont: 'Bitter',
  sansSerifFont: 'Roboto',
  monospaceFont: 'Consolas',
  defaultFont: 'Serif',
  defaultCJKFont: 'LXGW WenKai',
  defaultFontSize: 16,
  minimumFontSize: 8,
  fontWeight: 400,
};

// 默认视图设置 - 集成字体配置
export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  theme: 'light',
  overrideColor: false,
  invertImgColorInDark: false,
  
  // 字体设置（来自DEFAULT_BOOK_FONT）
  ...DEFAULT_BOOK_FONT,
  overrideFont: false,
  
  // 布局设置
  lineHeight: 1.6,
  fontFamily: 'default',
  marginTopPx: 48,
  marginBottomPx: 48,
  marginLeftPx: 48,
  marginRightPx: 48,
  gapPercent: 3.33,
  maxColumnCount: 2,
  maxInlineSize: 720,
  maxBlockSize: 1440,
  scrolled: false,
  animated: true,
  writingMode: 'auto',
  allowScript: false,
  showHeader: true,
  showFooter: true,
  doubleBorder: false,
  continuousScroll: false,
  disableClick: false,
  swapClickArea: false,
  volumeKeysToFlip: false,
  scrollingOverlap: 0,
  showBarsOnScroll: false,
  translationEnabled: false,
  translationProvider: 'google',
  translateTargetLang: 'en',
  showTranslateSource: false,
  uiLanguage: 'zh-CN',
  codeHighlighting: false,
  codeLanguage: 'auto-detect',
};

export const SUPPORTED_FORMATS = ['epub', 'pdf', 'txt', 'mobi', 'azw3', 'fb2', 'cbz'] as const;

export const BOOK_IDS_SEPARATOR = ',';

export const THEMES = [
  'light',
  'dark',
  'sepia',
  'solarized-light',
  'solarized-dark',
  'gruvbox-light',
  'gruvbox-dark',
] as const; 