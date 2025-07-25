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
  libraryCoverFit: 'cover',
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

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  theme: 'light',
  defaultFontSize: 16,
  lineHeight: 1.6,
  marginTopPx: 32,
  marginBottomPx: 16,
  marginLeftPx: 16,
  marginRightPx: 16,
  gapPercent: 5,
  maxColumnCount: 2,
  maxInlineSize: 800,
  maxBlockSize: 600,
  animated: true,
  scrolled: false,
  vertical: false,
  rtl: false,
  writingMode: 'horizontal-tb',
  doubleBorder: false,
  showHeader: false,
  showFooter: false,
  screenOrientation: 'auto',
  overrideColor: false,
  invertImgColorInDark: false,
  allowScript: false,
  codeHighlighting: true,
  sideBarTab: 'toc',
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