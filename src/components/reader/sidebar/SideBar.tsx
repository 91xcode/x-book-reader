import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';

import { Book } from '@/types/book';
import { BookDoc } from '@/libs/document';
import { useReaderStore } from '@/store/readerStore';
import { eventDispatcher } from '@/utils/event';
import SidebarHeader from './Header';
import SidebarContent from './Content';

const SideBar: React.FC<{
  isVisible: boolean;
  onGoToLibrary: () => void;
  onClose: () => void;
  book: Book;
  bookDoc: BookDoc;
}> = ({ isVisible, onGoToLibrary, onClose, book, bookDoc }) => {
  const { getView, getViewSettings } = useReaderStore();
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const sideBarBookKey = book.hash;

  const onNavigateEvent = async () => {
    const pinButton = document.querySelector('.sidebar-pin-btn');
    const isPinButtonHidden = !pinButton || window.getComputedStyle(pinButton).display === 'none';
    if (isPinButtonHidden) {
      onClose();
    }
  };

  useEffect(() => {
    eventDispatcher.on('navigate', onNavigateEvent);
    return () => {
      eventDispatcher.off('navigate', onNavigateEvent);
    };
  }, []);

  const handleToggleSearchBar = () => {
    setIsSearchBarVisible((prev) => !prev);
  };

  const handleTogglePin = () => {
    setIsPinned((prev) => !prev);
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        className={clsx(
          'sidebar-container bg-base-200 z-20 flex min-w-60 select-none flex-col',
          'h-full',
          'transition-[padding-top] duration-300',
          !isPinned && 'shadow-2xl',
        )}
        style={{
          width: '15%',
          maxWidth: '45%',
          position: isPinned ? 'relative' : 'absolute',
        }}
      >
        <div className='flex-shrink-0'>
          <SidebarHeader
            isPinned={isPinned}
            isSearchBarVisible={isSearchBarVisible}
            onGoToLibrary={onGoToLibrary}
            onClose={onClose}
            onTogglePin={handleTogglePin}
            onToggleSearchBar={handleToggleSearchBar}
          />
          <div className='border-base-300/50 border-b px-3 py-2'>
            <div className="text-sm font-medium">{book.title}</div>
            <div className="text-xs text-base-content/60">{book.author}</div>
          </div>
        </div>
        <SidebarContent bookDoc={bookDoc} sideBarBookKey={sideBarBookKey} />
      </div>
      {!isPinned && (
        <div
          className='overlay fixed inset-0 z-10 bg-black/50 sm:bg-black/20'
          onClick={onClose}
        />
      )}
    </>
  );
};

export default SideBar; 