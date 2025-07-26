import { SystemSettings, ReadSettings } from '@/types/settings';
import { ViewSettings, BookLayout, BookStyle, BookFont, ViewConfig, TTSConfig, TranslatorConfig, ScreenConfig } from '@/types/book';

export const SYSTEM_SETTINGS_VERSION = 1;

// 工具函数
const getDefaultMaxInlineSize = () => 720;
const getDefaultMaxBlockSize = () => 1440;
const isCJKEnv = () => {
  if (typeof window === 'undefined') return false;
  const lang = navigator.language || 'en';
  return ['zh', 'ja', 'ko'].some(l => lang.startsWith(l));
};
const getTargetLang = () => {
  if (typeof window === 'undefined') return 'EN';
  const lang = navigator.language || 'en';
  if (lang.startsWith('zh')) return 'ZH';
  if (lang.startsWith('ja')) return 'JA';
  if (lang.startsWith('ko')) return 'KO';
  return 'EN';
};

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
export const DEFAULT_BOOK_FONT: BookFont = {
  serifFont: 'Bitter',
  sansSerifFont: 'Roboto',
  monospaceFont: 'Consolas',
  defaultFont: 'Serif',
  defaultCJKFont: 'LXGW WenKai',
  defaultFontSize: 16,
  minimumFontSize: 8,
  fontWeight: 400,
};

// 默认布局设置 - 与readest项目完全一致
export const DEFAULT_BOOK_LAYOUT: BookLayout = {
  marginTopPx: 44,
  marginBottomPx: 44,
  marginLeftPx: 16,
  marginRightPx: 16,
  compactMarginTopPx: 16,
  compactMarginBottomPx: 16,
  compactMarginLeftPx: 16,
  compactMarginRightPx: 16,
  gapPercent: 5,
  scrolled: false,
  disableClick: false,
  swapClickArea: false,
  volumeKeysToFlip: false,
  continuousScroll: false,
  maxColumnCount: 2,
  maxInlineSize: getDefaultMaxInlineSize(),
  maxBlockSize: getDefaultMaxBlockSize(),
  animated: false,
  writingMode: 'auto',
  vertical: false,
  rtl: false,
  scrollingOverlap: 0,
  allowScript: false,
};

// 默认样式设置 - 与readest项目完全一致
export const DEFAULT_BOOK_STYLE: BookStyle = {
  zoomLevel: 100,
  paragraphMargin: 1,
  lineHeight: 1.6,
  wordSpacing: 0,
  letterSpacing: 0,
  textIndent: 0, // 恢复基础默认值为0，CJK环境通过DEFAULT_CJK_VIEW_SETTINGS设置为2
  fullJustification: true,
  hyphenation: true,
  invertImgColorInDark: false,
  theme: 'light',
  overrideFont: false,
  overrideLayout: false, // 恢复基础默认值为false，与readest保持一致
  overrideColor: false,
  codeHighlighting: false,
  codeLanguage: 'auto-detect',
  userStylesheet: '',
  userUIStylesheet: '',
};

// 移动端默认设置
export const DEFAULT_MOBILE_VIEW_SETTINGS: Partial<ViewSettings> = {
  fullJustification: false,
  animated: true,
  defaultFont: 'Sans-serif',
  marginBottomPx: 16,
};

// 中日韩语言环境默认设置
export const DEFAULT_CJK_VIEW_SETTINGS: Partial<ViewSettings> = {
  fullJustification: true,
  textIndent: 2,
};

// 默认视图配置
export const DEFAULT_VIEW_CONFIG: ViewConfig = {
  sideBarTab: 'toc',
  uiLanguage: '',
  sortedTOC: false,
  doubleBorder: false,
  borderColor: 'red',
  showHeader: true,
  showFooter: true,
  showBarsOnScroll: false,
  showRemainingTime: false,
  showRemainingPages: false,
  showPageNumber: true,
};

// 默认TTS配置
export const DEFAULT_TTS_CONFIG: TTSConfig = {
  ttsRate: 1.3,
  ttsVoice: '',
  ttsLocation: '',
};

// 默认翻译配置
export const DEFAULT_TRANSLATOR_CONFIG: TranslatorConfig = {
  translationEnabled: false,
  translationProvider: 'deepl',
  translateTargetLang: getTargetLang(),
  showTranslateSource: true,
};

// 默认屏幕配置
export const DEFAULT_SCREEN_CONFIG: ScreenConfig = {
  screenOrientation: 'auto',
};

// 合并所有默认视图设置
export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  ...DEFAULT_BOOK_LAYOUT,
  ...DEFAULT_BOOK_STYLE,
  ...DEFAULT_BOOK_FONT,
  ...DEFAULT_VIEW_CONFIG,
  ...DEFAULT_TTS_CONFIG,
  ...DEFAULT_TRANSLATOR_CONFIG,
  ...DEFAULT_SCREEN_CONFIG,
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