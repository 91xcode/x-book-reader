'use client';

import clsx from 'clsx';
import * as React from 'react';
import { Suspense, useState, useRef, useEffect } from 'react';

import { Book, BookDoc } from '@/types/book';
import { useReaderStore } from '@/store/readerStore';
import { useBookDataStore } from '@/store/bookDataStore';
import { SystemSettings } from '@/types/settings';
import Spinner from '@/components/ui/Spinner';
import SideBar from '@/components/reader/sidebar/SideBar';
import BookReader from '@/components/reader/BookReader';
import SettingsDialog from '@/components/reader/settings/SettingsDialog';
import CacheMonitor from '@/components/debug/CacheMonitor';
import { useSettingsStore } from '@/store/settingsStore';

// 异步组件 - 用于Suspense包装
const AsyncBookReader = React.lazy(() => 
  Promise.resolve({ default: BookReader })
);

const AsyncSideBar = React.lazy(() => 
  Promise.resolve({ default: SideBar })
);

interface ReaderContentProps {
  bookKey: string;
  onCloseBook: () => void;
  onOpenSettings: () => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  onGoToLibrary: () => void;
}

const ReaderContent: React.FC<ReaderContentProps> = ({ 
  bookKey,
  onCloseBook,
  onOpenSettings,
  isSidebarVisible,
  onToggleSidebar,
  onGoToLibrary,
}) => {
  const { getViewState } = useReaderStore();
  const { getBookData } = useBookDataStore();
  const { fontLayoutSettingsDialogOpen, setFontLayoutSettingsDialogOpen } = useSettingsStore();
  
  const viewState = getViewState(bookKey);
  const bookData = getBookData(bookKey);

  // 使用Suspense边界处理加载状态
  if (viewState?.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center space-y-4">
          <Spinner loading={true} />
          <div className="text-sm text-base-content/70">
            正在加载书籍...
          </div>
        </div>
      </div>
    );
  }

  if (viewState?.error) {
    throw new Error(viewState.error); // 让Error Boundary处理
  }

  if (!bookData?.book || !bookData?.bookDoc) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center space-y-4">
          <Spinner loading={true} />
          <div className="text-sm text-base-content/70">
            准备书籍数据...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-content flex h-screen bg-base-100">
      {/* Suspense包装的SideBar */}
      <Suspense fallback={
        <div className="w-80 h-full bg-base-200 flex items-center justify-center">
          <Spinner loading={true} />
        </div>
      }>
        <AsyncSideBar 
          isVisible={isSidebarVisible}
          onGoToLibrary={onGoToLibrary}
          onClose={() => onToggleSidebar()}
          book={bookData.book}
          bookDoc={bookData.bookDoc}
          bookKey={bookKey}
        />
      </Suspense>
      
      {/* Suspense包装的BookReader */}
      <div className="flex-1">
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <Spinner loading={true} />
          </div>
        }>
          <AsyncBookReader 
            book={bookData.book}
            bookDoc={bookData.bookDoc}
            bookKey={bookKey}
            onCloseBook={onCloseBook}
            onOpenSettings={onOpenSettings}
            isSidebarVisible={isSidebarVisible}
            onToggleSidebar={onToggleSidebar}
          />
        </Suspense>
      </div>

      {/* Settings Dialog */}
      {fontLayoutSettingsDialogOpen && bookData.book && bookKey && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Spinner loading={true} />
          </div>
        }>
          <SettingsDialog
            bookKey={bookKey}
            isOpen={fontLayoutSettingsDialogOpen}
            onClose={() => setFontLayoutSettingsDialogOpen(false)}
          />
        </Suspense>
      )}

      {/* 开发环境下的缓存监控 */}
      <CacheMonitor position="bottom-left" />
    </div>
  );
};

export default ReaderContent; 