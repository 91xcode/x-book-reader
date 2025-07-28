'use client';

import clsx from 'clsx';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { Book, BookDoc } from '@/types/book';
import { useReaderStore } from '@/store/readerStore';
import { SystemSettings } from '@/types/settings';
import { uniqueId } from '@/utils/misc';
import SideBar from '@/components/reader/sidebar/SideBar';
import BooksGrid from './BooksGrid';

const ReaderContent: React.FC<{ 
  ids?: string; 
  settings: SystemSettings;
  book: Book;
  bookDoc: BookDoc;
  bookKey: string;
}> = ({ ids, settings, book, bookDoc, bookKey }) => {
  const { getView, setBookKeys, getViewSettings } = useReaderStore();
  const { initViewState, getViewState, clearViewState } = useReaderStore();
  const isInitiating = useRef(false);
  const [loading, setLoading] = useState(false);

  const handleCloseBooks = async () => {
    // TODO: Implement close books logic
    console.log('Closing books');
  };

  const handleCloseBooksToLibrary = () => {
    handleCloseBooks();
    window.location.href = '/library';
  };

  const handleCloseBook = async (bookKey: string) => {
    // TODO: Implement close book logic
    console.log('Closing book:', bookKey);
    clearViewState(bookKey);
    window.location.href = '/library';
  };

  if (!book || !bookDoc) {
    setTimeout(() => setLoading(true), 300);
    return (
      loading && (
        <div className={clsx('hero hero-content h-dvh')}>
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )
    );
  }

  return (
    <div className={clsx('reader-content flex h-dvh')}>
      <SideBar 
        onGoToLibrary={handleCloseBooksToLibrary}
        book={book}
        bookDoc={bookDoc}
        bookKey={bookKey} // 🔧 传递centralized bookKey
        isVisible={true}
        onClose={() => {}}
      />
      <BooksGrid 
        bookKeys={[bookKey]} 
        onCloseBook={handleCloseBook}
        book={book}
        bookDoc={bookDoc}
      />
    </div>
  );
};

export default ReaderContent; 