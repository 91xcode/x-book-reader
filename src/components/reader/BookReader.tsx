import clsx from 'clsx';
import React from 'react';
import { useReaderStore } from '../../store/readerStore';
import { Book, BookDoc, BookConfig } from '../../types/book';

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
import FoliateViewer from './FoliateViewer';
import HeaderBar from './HeaderBar';
import FooterBar from './FooterBar';
import TTSControl from './tts/TTSControl';

interface BookReaderProps {
  book: Book;
  bookDoc: BookDoc;
  bookKey: string;
  onCloseBook: () => void;
  onOpenSettings: () => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({
  book,
  bookDoc,
  bookKey,
  onCloseBook,
  onOpenSettings,
  isSidebarVisible,
  onToggleSidebar,
}) => {
  // 🎯 使用传入的bookKey，遵循readest的正确做法
  const { getViewSettings, getView } = useReaderStore();
  const viewSettings = getViewSettings(bookKey);
  const view = getView(bookKey);

  // 如果viewSettings还没有初始化，显示加载状态
  if (!viewSettings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">加载字体设置中...</span>
      </div>
    );
  }

  // 使用实际的viewSettings构建config
  const config: BookConfig = {
    location: null,
    viewSettings
  };

  // 内容边距 - 参考 readest 项目
  const contentInsets: Insets = {
    top: 44, // HeaderBar 高度 (h-11 = 44px)
    right: 0,
    bottom: 0,
    left: 0,
  };

  // 顶部遮罩层高度 - 参考 readest 的 SectionInfo
  const topInset = 44; // 固定为 HeaderBar 高度

  return (
    <div className="book-reader relative h-full w-full overflow-hidden">
      {/* 顶部遮罩层 - 参考 readest 的 SectionInfo */}
      <div
        className="absolute left-0 right-0 top-0 z-10 bg-base-100"
        style={{
          height: `${topInset}px`,
        }}
      />
      
      {/* Header Bar - 绝对定位在顶部 */}
      <HeaderBar
        bookKey={bookKey}
        bookTitle={book.title}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        onCloseBook={onCloseBook}
        onOpenSettings={onOpenSettings}
      />

      {/* Main Content Area - 不需要额外的 paddingTop */}
      <div className="content-area relative h-full w-full">
        <FoliateViewer
          bookKey={bookKey}
          bookDoc={bookDoc}
          config={config}
          contentInsets={contentInsets}
        />
      </div>

      {/* TTS Control - 100%迁移自readest */}
      <TTSControl
        bookKey={bookKey}
      />

      {/* Footer Bar */}
      <FooterBar
        bookKey={bookKey}
        bookFormat={book.format}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};

export default BookReader; 