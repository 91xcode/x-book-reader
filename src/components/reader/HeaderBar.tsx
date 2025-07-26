import clsx from 'clsx';
import React, { useState } from 'react';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { GiBookshelf } from 'react-icons/gi';
import { FiSearch } from 'react-icons/fi';
import { MdOutlineMenu, MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { MdArrowBackIosNew } from 'react-icons/md';
import { RiFontSize } from 'react-icons/ri';
import { LuNotebookPen } from 'react-icons/lu';

import Dropdown from '@/components/ui/Dropdown';

interface HeaderBarProps {
  bookKey: string;
  bookTitle: string;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  onCloseBook: () => void;
  onOpenSettings: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  bookKey,
  bookTitle,
  isSidebarVisible,
  onToggleSidebar,
  onCloseBook,
  onOpenSettings,
}) => {
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [notebookVisible, setNotebookVisible] = useState(false);
  
  const isHeaderVisible = hoveredBookKey === bookKey || isDropdownOpen;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const ViewMenuContent = () => (
    <div className="view-menu dropdown-content no-triangle z-20 mt-1 border bg-base-200 border-base-200 shadow-2xl rounded-md p-3" style={{ maxWidth: '280px' }}>
      <div className="hover:bg-base-300 rounded px-3 py-2 cursor-pointer" onClick={onOpenSettings}>
        <span className="text-sm">字体和布局</span>
        <span className="float-right text-xs text-base-content/60">Shift+F</span>
      </div>
      <hr className="border-base-300 my-1" />
      <div className="hover:bg-base-300 rounded px-3 py-2 cursor-pointer">
        <span className="text-sm">从未同步</span>
      </div>
    </div>
  );

  return (
    <div className="bg-base-100 relative">
      {/* 悬停检测层 */}
      <div 
        className="absolute top-0 z-10 h-11 w-full"
        onMouseEnter={() => !isMobile && setHoveredBookKey(bookKey)}
        onTouchStart={() => !isMobile && setHoveredBookKey(bookKey)}
      />
      
      {/* 实际的Header内容 */}
      <div 
        className={clsx(
          'header-bar bg-base-100 relative z-10 flex h-11 w-full items-center pr-4 pl-4 border-b border-base-300',
          'transition-[opacity] duration-300',
          isHeaderVisible ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none opacity-0',
          isDropdownOpen && 'header-bar-pinned'
        )}
        onMouseLeave={() => !isMobile && setHoveredBookKey('')}
      >
        {/* 左侧区域 */}
        <div className="bg-base-100 sidebar-bookmark-toggler z-20 flex h-full items-center gap-x-4 pe-2">
          {/* SidebarToggler - 桌面端隐藏 */}
          <div className="hidden sm:flex">
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={onToggleSidebar}
              title="侧边栏"
            >
              {isSidebarVisible ? (
                <GiBookshelf className="w-4 h-4 text-base-content" />
              ) : (
                <GiBookshelf className="w-4 h-4 text-base-content" />
              )}
            </button>
          </div>
          
          {/* BookmarkToggler */}
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              if (isMobile) {
                setHoveredBookKey('');
              }
            }}
            title="书签"
          >
            {isBookmarked ? (
              <MdPushPin className="w-4 h-4 text-base-content" />
            ) : (
              <MdOutlinePushPin className="w-4 h-4 text-base-content" />
            )}
          </button>
          
          {/* TranslationToggler */}
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={() => {
              setTranslationEnabled(!translationEnabled);
              if (isMobile) {
                setHoveredBookKey('');
              }
            }}
            title="翻译"
          >
            <FiSearch className={clsx('w-4 h-4', translationEnabled ? 'text-blue-500' : 'text-base-content')} />
          </button>
        </div>

        {/* 中间标题 */}
        <div className="header-title z-15 bg-base-100 pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
          <h2 className="line-clamp-1 max-w-[50%] text-center text-xs font-semibold">
            {bookTitle}
          </h2>
        </div>

        {/* 右侧区域 */}
        <div className="bg-base-100 z-20 ml-auto flex h-full items-center space-x-4 ps-2">
          {/* SettingsToggler */}
          <button
            onClick={() => {
              setHoveredBookKey('');
              onOpenSettings();
            }}
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            title="字体和布局"
          >
            <RiFontSize className="w-4 h-4 text-base-content" />
          </button>

          {/* NotebookToggler */}
          <button
            onClick={() => {
              setNotebookVisible(!notebookVisible);
              if (isMobile) {
                setHoveredBookKey('');
              }
            }}
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            title="笔记本"
          >
            <LuNotebookPen className={clsx('w-4 h-4', notebookVisible ? 'text-blue-500' : 'text-base-content')} />
          </button>

          {/* ViewMenu Dropdown */}
          <Dropdown
            className='exclude-title-bar-mousedown dropdown-bottom dropdown-end'
            buttonClassName='btn btn-ghost h-8 min-h-8 w-8 p-0'
            toggleButton={<PiDotsThreeVerticalBold className="w-4 h-4" />}
          >
            <ViewMenuContent />
          </Dropdown>

          {/* WindowButtons - 关闭按钮 */}
          <button
            onClick={onCloseBook}
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            title="关闭"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar; 