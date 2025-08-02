export interface Book {
  hash: string;
  format: BookFormat;
  title: string;
  author: string;
  sourceTitle?: string;
  groupId?: string;
  groupName?: string;
  tags?: string[];
  progress?: number;
  readingStatus?: 'unread' | 'reading' | 'finished';
  lastReadAt?: number;
  totalPages?: number;
  currentPage?: number;
  metadata?: BookMetadata;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
  uploadedAt?: number | null;
  downloadedAt?: number | null;
  coverDownloadedAt?: number | null;
  url?: string;
  primaryLanguage?: string;
}

export type BookFormat = 'EPUB' | 'PDF' | 'TXT' | 'MOBI' | 'AZW3' | 'FB2' | 'CBZ' | 'FBZ';

export interface BookMetadata {
  title?: string;
  author?: string;
  description?: string;
  language?: string;
  publisher?: string;
  published?: string;
  subject?: string;
  rights?: string;
  series?: string;
  seriesIndex?: number;
  identifier?: string;
  cover?: string;
}

export interface BookConfig {
  bookHash?: string;
  location?: any;
  progress?: any;
  searchConfig?: any;
  viewSettings?: ViewSettings;
  updatedAt?: number;
}

export type WritingMode = 'auto' | 'horizontal-tb' | 'horizontal-rl' | 'vertical-rl';

export interface BookLayout {
  marginTopPx: number;
  marginBottomPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  marginPx?: number; // deprecated
  compactMarginTopPx: number;
  compactMarginBottomPx: number;
  compactMarginLeftPx: number;
  compactMarginRightPx: number;
  compactMarginPx?: number; // deprecated
  gapPercent: number;
  scrolled: boolean;
  disableClick: boolean;
  swapClickArea: boolean;
  volumeKeysToFlip: boolean;
  continuousScroll: boolean;
  maxColumnCount: number;
  maxInlineSize: number;
  maxBlockSize: number;
  animated: boolean;
  writingMode: WritingMode;
  vertical: boolean;
  rtl: boolean;
  scrollingOverlap: number;
  allowScript: boolean;
}

export interface BookStyle {
  zoomLevel: number;
  paragraphMargin: number;
  lineHeight: number;
  wordSpacing: number;
  letterSpacing: number;
  textIndent: number;
  fullJustification: boolean;
  hyphenation: boolean;
  invertImgColorInDark: boolean;
  theme: string;
  overrideFont: boolean;
  overrideLayout: boolean;
  overrideColor: boolean;
  codeHighlighting: boolean;
  codeLanguage: string;
  userStylesheet: string;
  userUIStylesheet: string;
}

export interface BookFont {
  serifFont: string;
  sansSerifFont: string;
  monospaceFont: string;
  defaultFont: string;
  defaultCJKFont: string;
  defaultFontSize: number;
  minimumFontSize: number;
  fontWeight: number;
}

export interface ViewConfig {
  sideBarTab: 'toc' | 'annotations' | 'bookmarks';
  uiLanguage: string;
  sortedTOC: boolean;
  doubleBorder: boolean;
  borderColor: string;
  showHeader: boolean;
  showFooter: boolean;
  showBarsOnScroll: boolean;
  showRemainingTime: boolean;
  showRemainingPages: boolean;
  showPageNumber: boolean;
}

export interface TTSConfig {
  ttsRate: number;
  ttsVoice: string;
  ttsLocation: string;
}

export interface TranslatorConfig {
  translationEnabled: boolean;
  translationProvider: string;
  translateTargetLang: string;
  showTranslateSource: boolean;
}

export interface ScreenConfig {
  screenOrientation: 'auto' | 'portrait' | 'landscape';
}

export interface ViewSettings extends BookLayout, BookStyle, BookFont, ViewConfig, TTSConfig, TranslatorConfig, ScreenConfig {}

export interface BookDoc {
  book?: any;
  metadata: BookMetadata;
  toc?: TOCItem[];
  sections?: SectionItem[];
  rendition?: any;
  dir: string;
  transformTarget?: EventTarget;
  splitTOCHref(href: string): Array<string | number>;
  resolveHref(href: string): { index: number; anchor: ((doc: Document) => Element | number) | (() => number) };
  getCover(): Promise<Blob | null>;
}

export interface SectionItem {
  id: string;
  cfi: string;
  size: number;
  linear: string;
  location?: Location;
  load?: () => Promise<string>;
  unload?: () => void;
}

export interface TOCItem {
  id?: number;
  label: string;
  href: string;
  cfi?: string;
  location?: Location;
  subitems?: TOCItem[];
}

export interface PageInfo {
  current: number;
  total: number;
  next?: number;
}

export interface TimeInfo {
  section: number;
  total: number;
}

export interface Location {
  current: number;
  next?: number;
  total: number;
}

export interface PageInfo {
  current: number;
  total: number;
  section?: string;
  location?: any;
}

export type HighlightStyle = 'underline' | 'highlight' | 'strikethrough';
export type HighlightColor = string;

// 书籍注释/书签
export interface BookNote {
  id: string;
  cfi: string;
  text?: string;
  note?: string;
  type: BookNoteType;
  color?: string;
  style?: HighlightStyle;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export type BookNoteType = 'annotation' | 'bookmark' | 'highlight';

// 书籍搜索配置
export interface BookSearchConfig {
  query: string;
  caseSensitive?: boolean;
  wholeWords?: boolean;
  useRegex?: boolean;
}

// 搜索结果
export interface BookSearchResult {
  cfi: string;
  excerpt: string;
  section: string;
  subitems?: BookSearchResult[];
}

// 书籍注释组
export interface BooknoteGroup {
  id: number;
  href: string;
  label: string;
  booknotes: BookNote[];
}

// 设置面板类型
export type SettingsPanelType = 'Font' | 'Layout' | 'Color' | 'Control' | 'Language' | 'Custom'; 