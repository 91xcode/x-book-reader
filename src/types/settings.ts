import { ViewSettings, HighlightStyle, HighlightColor } from './book';

export interface ReadSettings {
  sideBarWidth: string;
  isSideBarPinned: boolean;
  notebookWidth: string;
  isNotebookPinned: boolean;
  autohideCursor: boolean;
  translationProvider: string;
  translateTargetLang: string;
  highlightStyle: HighlightStyle;
  highlightStyles: Record<HighlightStyle, HighlightColor>;
  customThemes: CustomTheme[];
}

export interface SystemSettings {
  version: number;
  localBooksDir: string;
  keepLogin: boolean;
  autoUpload: boolean;
  alwaysOnTop: boolean;
  openBookInNewWindow: boolean;
  autoCheckUpdates: boolean;
  screenWakeLock: boolean;
  alwaysShowStatusBar: boolean;
  openLastBooks: boolean;
  lastOpenBooks: string[];
  autoImportBooksOnOpen: boolean;
  telemetryEnabled: boolean;
  libraryViewMode: LibraryViewModeType;
  librarySortBy: LibrarySortByType;
  librarySortAscending: boolean;
  libraryCoverFit: LibraryCoverFitType;
  lastSyncedAtBooks: number;
  lastSyncedAtConfigs: number;
  lastSyncedAtNotes: number;
  globalReadSettings: ReadSettings;
  globalViewSettings: ViewSettings;
}

export interface CustomTheme {
  name: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
  };
}

export type LibraryViewModeType = 'grid' | 'list';
export type LibrarySortByType = 'title' | 'author' | 'updated' | 'created' | 'format';
export type LibraryCoverFitType = 'crop' | 'fit';
export type SettingsPanelType = 'Font' | 'Layout' | 'Color' | 'Control' | 'Language' | 'Custom';

// 阅读状态
export type ReadingStatus = 'unread' | 'reading' | 'finished';

// 书籍过滤选项
export interface BookFilter {
  status?: ReadingStatus[];
  formats?: string[];
  searchFields?: ('title' | 'author' | 'description' | 'format')[];
} 