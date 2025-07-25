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
  theme: string;
  defaultFontSize: number;
  lineHeight: number;
  marginTopPx: number;
  marginBottomPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  gapPercent: number;
  maxColumnCount: number;
  maxInlineSize: number;
  maxBlockSize: number;
  animated: boolean;
  scrolled: boolean;
  vertical: boolean;
  rtl: boolean;
  writingMode: string;
  doubleBorder: boolean;
  showHeader: boolean;
  showFooter: boolean;
  screenOrientation: string;
  overrideColor?: boolean;
  invertImgColorInDark?: boolean;
  allowScript?: boolean;
  codeHighlighting?: boolean;
  sideBarTab?: string;
}

export interface BookDoc {
  book?: any;
  metadata: BookMetadata;
  toc?: TOCItem[];
  sections?: SectionItem[];
  rendition?: any;
  dir: string;
  splitTOCHref(href: string): Array<string | number>;
  getCover(): Promise<Blob | null>;
}

export interface SectionItem {
  id: string;
  cfi: string;
  size: number;
  linear: string;
  location?: Location;
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