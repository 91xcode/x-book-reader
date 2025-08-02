import clsx from 'clsx';
import React, { useState } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri';
import { RiArrowLeftDoubleLine, RiArrowRightDoubleLine } from 'react-icons/ri';
import { FaHeadphones } from 'react-icons/fa6';
import { IoIosList as TOCIcon } from 'react-icons/io';
import { PiNotePencil as NoteIcon } from 'react-icons/pi';
import { RxSlider as SliderIcon } from 'react-icons/rx';
import { RiFontFamily as FontIcon } from 'react-icons/ri';
import { MdOutlineHeadphones as TTSIcon } from 'react-icons/md';

import { useReaderStore } from '@/store/readerStore';
import { usePagination } from '@/hooks/usePagination';

interface FooterBarProps {
  bookKey: string;
  bookFormat: string;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

const FooterBar: React.FC<FooterBarProps> = ({
  bookKey,
  bookFormat,
  isSidebarVisible,
  onToggleSidebar,
  onOpenSettings,
}) => {
  const { getView, getProgress, getViewSettings, getHoveredBookKey, setHoveredBookKey } = useReaderStore();
  const hoveredBookKey = getHoveredBookKey();
  const [actionTab, setActionTab] = useState('');
  
  const view = getView(bookKey);
  const progress = getProgress(bookKey);
  const viewSettings = getViewSettings(bookKey);
  
  const {
    goLeft,
    goRight,
    goPrev,
    goNext,
    goPrevSection,
    goNextSection,
    goBack,
    goForward,
  } = usePagination(bookKey);
  
  const isVisible = hoveredBookKey === bookKey;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const handleProgressChange = (value: number) => {
    view?.goToFraction(value / 100.0);
  };

  const handleGoPrevPage = () => {
    goLeft();
  };

  const handleGoNextPage = () => {
    goRight();
  };

  const handleGoPrevSection = () => {
    goPrevSection();
  };

  const handleGoNextSection = () => {
    goNextSection();
  };

  const handleGoBack = () => {
    goBack();
  };

  const handleGoForward = () => {
    goForward();
  };

  const handleSpeakText = () => {
    // 按照readest的模式：直接触发TTS事件
    // 不传递range或selection信息，让TTSControl自己处理
    if (view) {
      const event = new CustomEvent('tts-speak', {
        detail: { 
          bookKey
          // 移除useSelection，避免WrongDocumentError
        }
      });
      document.dispatchEvent(event);
    }
  };

  const handleSetActionTab = (tab: string) => {
    setActionTab(actionTab === tab ? '' : tab);
    if (tab === 'tts') {
      setHoveredBookKey('');
      handleSpeakText();
    } else if (tab === 'toc') {
      setHoveredBookKey('');
      onToggleSidebar();
    } else if (tab === 'note') {
      setHoveredBookKey('');
      onToggleSidebar();
    }
  };

  // 优先使用有数据的进度信息
  const progressInfo = progress?.section || progress?.pageinfo;
  const progressValid = !!progressInfo;
  const progressFraction =
    progressValid && progressInfo?.total > 0
      ? (progressInfo!.current + 1) / progressInfo!.total || 0
      : 0;
  
  // 页码信息显示
  const pageDisplayText = progressInfo
    ? ['PDF', 'CBZ'].includes(bookFormat)
      ? `${progressInfo.current + 1} / ${progressInfo.total}`
      : `Loc. ${progressInfo.current + 1} / ${progressInfo.total}`
    : '';



  return (
    <>


      {/* 悬停检测层 */}
      <div
        className={clsx(
          'absolute bottom-0 left-0 z-10 hidden w-full sm:flex sm:h-[52px]',
        )}
        onMouseEnter={() => !isMobile && setHoveredBookKey(bookKey)}
        onTouchStart={() => !isMobile && setHoveredBookKey(bookKey)}
      />
      
      {/* Footer Bar */}
      <div
        className={clsx(
          'footer-bar shadow-xs absolute bottom-0 z-50 flex w-full flex-col',
          'sm:h-[52px] sm:justify-center',
          'sm:bg-base-100 border-base-300/50 border-t sm:border-none',
          'transition-[opacity,transform] duration-300',
          isVisible
            ? `pointer-events-auto translate-y-0 opacity-100`
            : `pointer-events-none translate-y-full opacity-0 sm:translate-y-0`,
        )}
        onMouseLeave={() => window.innerWidth >= 640 && setHoveredBookKey('')}
        aria-hidden={!isVisible}
      >
        {/* Mobile footer bar */}
        <div
          className={clsx(
            'bg-base-200 absolute bottom-16 flex w-full flex-col items-center gap-y-8 px-4 transition-all sm:hidden',
            actionTab === 'progress'
              ? 'pointer-events-auto translate-y-0 pb-4 pt-8 ease-out'
              : 'pointer-events-none invisible translate-y-full overflow-hidden pb-0 pt-0 ease-in',
          )}
          style={{
            bottom: isMobile ? '64px' : '64px',
          }}
        >
          {/* 移动端页码信息显示 */}
          <div className='flex w-full items-center justify-between px-4 text-sm'>
            <span className='text-center min-w-[80px]'>
              {pageDisplayText}
            </span>
            <span className='text-center text-xs text-base-content/70'>
              {progressValid ? `${Math.round(progressFraction * 100)}%` : ''}
            </span>
          </div>
          
          <div className='flex w-full items-center justify-between gap-x-6'>
            <input
              type='range'
              className='text-base-content mx-2 w-full'
              min={0}
              max={100}
              value={progressValid ? progressFraction * 100 : 0}
              onChange={(e) =>
                handleProgressChange(parseInt((e.target as HTMLInputElement).value, 10))
              }
            />
          </div>
          <div className='flex w-full items-center justify-between gap-x-6'>
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={handleGoPrevSection}
              title="上一章节"
            >
              <RiArrowLeftDoubleLine className="w-4 h-4" />
            </button>
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={handleGoPrevPage}
              title="上一页"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </button>
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={handleGoBack}
              title="后退"
              disabled={!view?.history?.canGoBack}
            >
              <RiArrowGoBackLine className="w-4 h-4" />
            </button>
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={handleGoForward}
              title="前进"
              disabled={!view?.history?.canGoForward}
            >
              <RiArrowGoForwardLine className="w-4 h-4" />
            </button>
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={handleGoNextPage}
              title="下一页"
            >
              <RiArrowRightSLine className="w-4 h-4" />
            </button>
            <button
              className="btn btn-ghost h-8 min-h-8 w-8 p-0"
              onClick={handleGoNextSection}
              title="下一章节"
            >
              <RiArrowRightDoubleLine className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Mobile action buttons */}
        <div
          className={clsx(
            'bg-base-200 z-50 mt-auto flex w-full justify-between px-8 py-4 sm:hidden',
          )}
          style={{
            paddingBottom: isMobile ? '16px' : '0px',
          }}
        >
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={() => handleSetActionTab('toc')}
            title="目录"
          >
            <TOCIcon className="w-5 h-5" />
          </button>
          <button 
            className="btn btn-ghost h-8 min-h-8 w-8 p-0" 
            onClick={() => handleSetActionTab('note')}
            title="注释"
          >
            <NoteIcon className="w-5 h-5" />
          </button>
          <button
            className={clsx("btn btn-ghost h-8 min-h-8 w-8 p-0", actionTab === 'progress' && 'text-blue-500')}
            onClick={() => handleSetActionTab('progress')}
            title="进度"
          >
            <SliderIcon className="w-5 h-5" />
          </button>
          <button
            className={clsx("btn btn-ghost h-8 min-h-8 w-8 p-0", actionTab === 'font' && 'text-blue-500')}
            onClick={() => handleSetActionTab('font')}
            title="字体"
          >
            <FontIcon className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={() => handleSetActionTab('tts')}
            title="朗读"
          >
            <TTSIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Desktop / Pad footer bar */}
        <div className='absolute hidden h-full w-full items-center gap-x-4 px-4 sm:flex'>
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={handleGoPrevSection}
            title="上一章节"
          >
            <RiArrowLeftDoubleLine className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={handleGoPrevPage}
            title="上一页"
          >
            <RiArrowLeftSLine className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={handleGoBack}
            title="后退"
            disabled={!view?.history?.canGoBack}
          >
            <RiArrowGoBackLine className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={handleGoForward}
            title="前进"
            disabled={!view?.history?.canGoForward}
          >
            <RiArrowGoForwardLine className="w-4 h-4" />
          </button>
          <span className='mx-2 text-center text-sm min-w-[80px]'>
            {pageDisplayText}
          </span>
          <span className='mx-2 text-center text-xs text-base-content/70'>
            {progressValid ? `${Math.round(progressFraction * 100)}%` : ''}
          </span>
          <input
            type='range'
            className='text-base-content mx-2 w-full'
            min={0}
            max={100}
            value={progressValid ? progressFraction * 100 : 0}
            onChange={(e) =>
              handleProgressChange(parseInt((e.target as HTMLInputElement).value, 10))
            }
          />
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={handleSpeakText}
            title="朗读"
          >
            <FaHeadphones className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={handleGoNextPage}
            title="下一页"
          >
            <RiArrowRightSLine className="w-4 h-4" />
          </button>
          <button
            className="btn btn-ghost h-8 min-h-8 w-8 p-0"
            onClick={handleGoNextSection}
            title="下一章节"
          >
            <RiArrowRightDoubleLine className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default FooterBar; 