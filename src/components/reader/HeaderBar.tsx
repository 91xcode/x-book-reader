import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { FiSearch } from 'react-icons/fi';
import { MdOutlineMenu, MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { MdArrowBackIosNew } from 'react-icons/md';
import { RiFontSize } from 'react-icons/ri';
import { LuNotebookPen } from 'react-icons/lu';
import { MdCheck } from 'react-icons/md';

// 自定义侧边栏图标组件
const SidebarToggleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={className}
    height="16px" 
    width="16px" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 21a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3zm12 -16h-8v14h8a1 1 0 0 0 1 -1v-12a1 1 0 0 0 -1 -1"></path>
  </svg>
);

import Dropdown from '@/components/ui/Dropdown';
import { useReaderStore } from '@/store/readerStore';

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
  const { getView, getViewSettings, setViewSettings } = useReaderStore();
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [notebookVisible, setNotebookVisible] = useState(false);
  
  const isHeaderVisible = hoveredBookKey === bookKey || isDropdownOpen;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const ViewMenuContent = () => {
    const viewSettings = getViewSettings(bookKey);
    const [isScrolledMode, setIsScrolledMode] = useState(viewSettings?.scrolled || false);
    
    // 同步 store 中的滚动模式状态
    useEffect(() => {
      if (viewSettings?.scrolled !== undefined) {
        setIsScrolledMode(viewSettings.scrolled);
      }
    }, [viewSettings?.scrolled]);
    
    const toggleScrolledMode = () => {
      const newScrolledMode = !isScrolledMode;
      setIsScrolledMode(newScrolledMode);
      
      // 更新 store 中的设置
      if (viewSettings) {
        const updatedSettings = { ...viewSettings, scrolled: newScrolledMode };
        setViewSettings(bookKey, updatedSettings);
        
        // 更新 Foliate.js 视图的 flow 属性
        const view = getView(bookKey);
        if (view?.renderer) {
          view.renderer.setAttribute('flow', newScrolledMode ? 'scrolled' : 'paginated');
          console.log('Switched to', newScrolledMode ? 'scrolled' : 'paginated', 'mode');
        }
      }
    };

    return (
      <div className="view-menu dropdown-content no-triangle z-20 mt-1 border bg-base-200 border-base-200 shadow-2xl rounded-md p-3" style={{ maxWidth: '280px' }}>
        <button 
          className="hover:bg-base-300 text-base-content flex w-full flex-col items-center justify-center rounded-md p-1 py-[10px]"
          onClick={onOpenSettings}
        >
          <div className='flex w-full items-center justify-between'>
            <div className='flex min-w-0 items-center'>
              <span style={{ minWidth: '16px' }}></span>
              <span className='mx-2 flex-1 truncate text-base sm:text-sm'>字体和布局</span>
            </div>
            <kbd className='border-base-300/40 bg-base-300/75 text-neutral-content hidden rounded-md border shadow-sm sm:flex shrink-0 px-1.5 py-0.5 text-xs font-medium'>Shift+F</kbd>
          </div>
        </button>
        <hr className="border-base-300 my-1" />
        <button 
          className="hover:bg-base-300 text-base-content flex w-full flex-col items-center justify-center rounded-md p-1 py-[10px]"
          onClick={toggleScrolledMode}
        >
          <div className='flex w-full items-center justify-between'>
            <div className='flex min-w-0 items-center'>
              <span style={{ minWidth: '16px' }}></span>
              <span className='mx-2 flex-1 truncate text-base sm:text-sm'>滚动模式</span>
            </div>
            {isScrolledMode && (
              <span className="text-base-content">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        </button>
        <hr className="border-base-300 my-1" />
        <button 
          className="hover:bg-base-300 text-base-content flex w-full flex-col items-center justify-center rounded-md p-1 py-[10px]"
        >
          <div className='flex w-full items-center justify-between'>
            <div className='flex min-w-0 items-center'>
              <span style={{ minWidth: '16px' }}></span>
              <span className='mx-2 flex-1 truncate text-base sm:text-sm'>从未同步</span>
            </div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-base-100 absolute top-0 w-full z-20">
      {/* 悬停检测层 */}
      <div 
        className="absolute top-0 z-10 h-11 w-full"
        onMouseEnter={() => !isMobile && setHoveredBookKey(bookKey)}
        onTouchStart={() => !isMobile && setHoveredBookKey(bookKey)}
      />
      
      {/* 实际的Header内容 */}
      <div 
        className={clsx(
          'header-bar bg-base-100 absolute top-0 z-10 flex h-11 w-full items-center pr-4 pl-4 border-b border-base-300',
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
              <SidebarToggleIcon className="text-base-content" />
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