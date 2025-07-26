import clsx from 'clsx';
import React from 'react';

import { Book } from '@/types/book';
import { BookDoc } from '@/libs/document';
import { BookConfig } from '@/types/book';

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
import FoliateViewer from './FoliateViewer';
import HeaderBar from './HeaderBar';
import FooterBar from './FooterBar';

interface BookReaderProps {
  book: Book;
  bookDoc: BookDoc;
  onCloseBook: () => void;
  onOpenSettings: () => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({
  book,
  bookDoc,
  onCloseBook,
  onOpenSettings,
  isSidebarVisible,
  onToggleSidebar,
}) => {
  // 简化的配置
  const config: BookConfig = {
    location: null,
    viewSettings: {
      theme: 'light',
      defaultFontSize: 16,
      lineHeight: 1.6,
      fontFamily: 'serif',
      marginTopPx: 48,
      marginBottomPx: 48,
      marginLeftPx: 48,
      marginRightPx: 48,
      gapPercent: 3.33,
      maxColumnCount: 2,
      maxInlineSize: 720,
      maxBlockSize: 1440,
      overrideColor: false,
      invertImgColorInDark: false,
      scrolled: false,
      animated: true,
      writingMode: 'auto',
      allowScript: false,
      showHeader: true,
      showFooter: true,
      doubleBorder: false
    }
  };

  // 内容边距
  const contentInsets: Insets = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  return (
    <div className="book-reader relative h-full w-full overflow-hidden">
      {/* Header Bar */}
      <HeaderBar
        bookKey={book.hash}
        bookTitle={book.title}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        onCloseBook={onCloseBook}
        onOpenSettings={onOpenSettings}
      />

      {/* Main Content Area */}
      <div className="content-area relative h-full w-full">
        <FoliateViewer
          bookKey={book.hash}
          bookDoc={bookDoc}
          config={config}
          contentInsets={contentInsets}
        />
      </div>

      {/* Footer Bar */}
      <FooterBar
        bookKey={book.hash}
        bookFormat={book.format}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};

export default BookReader; 