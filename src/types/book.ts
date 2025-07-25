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

export type BookFormat = 'epub' | 'pdf' | 'txt' | 'mobi' | 'azw3' | 'fb2' | 'cbz';

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
  rendition?: any;
  dir?: string;
}

export interface TOCItem {
  label: string;
  href: string;
  subitems?: TOCItem[];
}

export interface PageInfo {
  current: number;
  total: number;
  section?: string;
  location?: any;
}

export type HighlightStyle = 'underline' | 'highlight' | 'strikethrough';
export type HighlightColor = string; 