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

export interface ViewSettings {
  theme: 'light' | 'dark' | 'sepia' | 'auto';
  defaultFontSize: number;
  lineHeight: number;
  fontFamily?: string;
  marginTopPx: number;
  marginBottomPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  gapPercent?: number;
  maxColumnCount?: number;
  maxInlineSize?: number;
  maxBlockSize?: number;
  overrideColor?: boolean;
  invertImgColorInDark?: boolean;
  scrolled?: boolean;
  animated?: boolean;
  writingMode?: 'auto' | 'horizontal-tb' | 'vertical-rl' | 'horizontal-rl';
  allowScript?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  doubleBorder?: boolean;
}

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