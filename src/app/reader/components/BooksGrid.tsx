import clsx from 'clsx';
import React, { useEffect } from 'react';

import { useReaderStore } from '@/store/readerStore';
import { Book, BookDoc, BookConfig } from '@/types/book';
import FoliateViewer from '@/components/reader/FoliateViewer';
import HeaderBar from '@/components/reader/HeaderBar';
import FooterBar from '@/components/reader/FooterBar';

interface BooksGridProps {
  bookKeys: string[];
  onCloseBook: (bookKey: string) => void;
  book: Book;
  bookDoc: BookDoc;
}

const BooksGrid: React.FC<BooksGridProps> = ({ bookKeys, onCloseBook, book, bookDoc }) => {
  const { getProgress, getViewState, getViewSettings } = useReaderStore();
  
  const contentInsets = {
    top: 44,
    right: 0,
    bottom: 44,
    left: 0,
  };

  const config: BookConfig = {
    location: null,
    viewSettings: getViewSettings(bookKeys[0]) || undefined,
  };

  useEffect(() => {
    if (book) {
      document.title = book.title;
    }
  }, [book]);

  return (
    <div className={clsx('books-grid bg-base-100 relative grid h-full flex-grow')}>
      {bookKeys.map((bookKey, index) => {
        const viewSettings = getViewSettings(bookKey);
        if (!viewSettings) return null;

        return (
          <div
            id={`gridcell-${bookKey}`}
            key={bookKey}
            className={clsx('relative h-full w-full overflow-hidden')}
          >
            <HeaderBar
              bookKey={bookKey}
              bookTitle={book.title}
              isSidebarVisible={true}
              onToggleSidebar={() => {}}
              onCloseBook={() => onCloseBook(bookKey)}
              onOpenSettings={() => {}}
            />
            <FoliateViewer
              bookKey={bookKey}
              bookDoc={bookDoc}
              config={config}
              contentInsets={contentInsets}
            />
            <FooterBar
              bookKey={bookKey}
              bookFormat={book.format}
              isSidebarVisible={true}
              onToggleSidebar={() => {}}
              onOpenSettings={() => {}}
            />
          </div>
        );
      })}
    </div>
  );
};

export default BooksGrid; 