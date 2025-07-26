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
  // 使用readerStore中的实际viewSettings，而不是硬编码
  const { getViewSettings } = useReaderStore();
  const bookKey = `${book.hash}-primary`; // 生成book key
  const viewSettings = getViewSettings(bookKey);

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
        bookKey={book.hash}
        bookTitle={book.title}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        onCloseBook={onCloseBook}
        onOpenSettings={onOpenSettings}
      />

      {/* Main Content Area - 不需要额外的 paddingTop */}
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