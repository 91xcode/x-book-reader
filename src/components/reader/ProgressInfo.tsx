import clsx from 'clsx';
import React from 'react';
import { PageInfo, TimeInfo } from '@/types/book';
import { useReaderStore } from '@/store/readerStore';

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ProgressInfoProps {
  bookKey: string;
  bookFormat: string;
  section?: PageInfo;
  pageinfo?: PageInfo;
  timeinfo?: TimeInfo;
  horizontalGap: number;
  contentInsets: Insets;
  gridInsets: Insets;
}

const ProgressInfo: React.FC<ProgressInfoProps> = ({
  bookKey,
  bookFormat,
  section,
  pageinfo,
  timeinfo,
  horizontalGap,
  contentInsets,
  gridInsets,
}) => {
  const { getView, getViewSettings } = useReaderStore();
  const view = getView(bookKey);
  const viewSettings = getViewSettings(bookKey);

  if (!viewSettings) {
    return null;
  }



  const showDoubleBorder = viewSettings.vertical && viewSettings.doubleBorder;
  const isScrolled = viewSettings.scrolled;
  const isVertical = viewSettings.vertical;
  
  // 页码信息计算 - 修复逻辑，优先使用有数据的项
  const pageInfo = (() => {
    // 优先使用 section 数据（适用于大多数格式）
    if (section && section.current >= 0 && section.total > 0) {
      if (['PDF', 'CBZ'].includes(bookFormat)) {
        return isVertical
          ? `${section.current + 1} · ${section.total}`
          : `${section.current + 1} / ${section.total}`;
      } else {
        // EPUB等格式显示为位置
        return isVertical 
          ? `${section.current + 1} · ${section.total}`
          : `Loc. ${section.current + 1} / ${section.total}`;
      }
    }
    
    // 备用：使用 pageinfo 数据
    if (pageinfo && pageinfo.current >= 0 && pageinfo.total > 0) {
      return isVertical 
        ? `${pageinfo.current + 1} · ${pageinfo.total}`
        : `Loc. ${pageinfo.current + 1} / ${pageinfo.total}`;
    }
    
    return '';
  })();



  // 剩余时间计算
  const timeLeft = timeinfo
    ? `${Math.round(timeinfo.section)} min left in chapter`
    : '';

  // 剩余页数计算
  const { page = 0, pages = 0 } = view?.renderer || {};
  const pageLeft =
    pages - 1 > page ? `${pages - 1 - page} pages left in chapter` : '';

  return (
    <div
      className={clsx(
        'progressinfo absolute bottom-0 flex items-center justify-between',
        'text-base-content/90 font-sans text-xs font-light',
        'drop-shadow-sm',
        isVertical ? 'writing-vertical-rl' : 'h-[52px] w-full',
        isScrolled && !isVertical && 'bg-base-100',
      )}
      style={
        isVertical
          ? {
              bottom: `${contentInsets.bottom * 1.5}px`,
              left: showDoubleBorder
                ? `calc(${contentInsets.left}px)`
                : `calc(${Math.max(0, contentInsets.left - 32)}px)`,
              width: showDoubleBorder ? '32px' : `${horizontalGap}%`,
              height: `calc(100% - ${((contentInsets.top + contentInsets.bottom) / 2) * 3}px)`,
            }
          : {
              paddingInlineStart: `calc(${horizontalGap / 2}% + ${contentInsets.left}px)`,
              paddingInlineEnd: `calc(${horizontalGap / 2}% + ${contentInsets.right}px)`,
              paddingBottom: gridInsets.bottom > 0 ? `${gridInsets.bottom * 0.67}px` : 0,
            }
      }
    >
      {/* 左侧显示剩余时间或剩余页数 */}
      {viewSettings.showRemainingTime ? (
        <span className='text-start'>{timeLeft}</span>
      ) : viewSettings.showRemainingPages ? (
        <span className='text-start'>{pageLeft}</span>
      ) : null}
      
      {/* 右侧显示页码信息 */}
      {viewSettings.showPageNumber && <span className='ms-auto text-end'>{pageInfo}</span>}
    </div>
  );
};

export default ProgressInfo;