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
  bookKey: string; // 🔧 接收完整的bookKey作为props
}> = ({ isVisible, onGoToLibrary, onClose, book, bookDoc, bookKey }) => {
  const { getView, getViewSettings } = useReaderStore();
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(true); // 默认固定侧边栏
  
  // 🔧 直接使用传入的bookKey，而不是从book.hash生成
  const sideBarBookKey = bookKey;

  // 🔍 调试：侧边栏bookKey追踪
  useEffect(() => {
    console.group('🔍 SideBar调试');
    console.log('传入的book.hash:', book.hash);
    console.log('传入的完整bookKey:', bookKey);
    console.log('使用的sideBarBookKey:', sideBarBookKey);
    console.log('侧边栏是否可见:', isVisible);
    
    // 检查这个bookKey对应的视图
    const view = getView(sideBarBookKey);
    console.log('侧边栏获取的视图:', view ? '✅ 存在' : '❌ null');
    
    if (!view) {
      console.warn('⚠️ 侧边栏无法获取视图，可能原因：');
      console.warn('1. FoliateViewer还未完成初始化');
      console.warn('2. bookKey不匹配');
      console.warn('预期bookKey格式: hash-uniqueId');
      console.warn('当前bookKey:', sideBarBookKey);
    }
    
    console.groupEnd();
  }, [sideBarBookKey, isVisible, getView, book.hash, bookKey]);

  const onNavigateEvent = async (event: CustomEvent) => {
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