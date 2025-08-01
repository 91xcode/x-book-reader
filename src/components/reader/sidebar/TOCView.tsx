import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';

import { useOverlayScrollbars } from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';
import { TOCItem } from '@/types/book';
import { useReaderStore } from '@/store/readerStore';
import { findParentPath } from '@/utils/toc';
import { eventDispatcher } from '@/utils/event';
import { getContentMd5 } from '@/utils/misc';
import { FlatTOCItem, StaticListRow, VirtualListRow } from './TOCItem';

const useFlattenedTOC = (toc: TOCItem[], expandedItems: Set<string>) => {
  return useMemo(() => {
    const flattenTOC = (items: TOCItem[], depth = 0): FlatTOCItem[] => {
      const result: FlatTOCItem[] = [];
      items.forEach((item, index) => {
        const isExpanded = expandedItems.has(item.href || '');
        result.push({ item, depth, index, isExpanded });
        if (item.subitems && isExpanded) {
          result.push(...flattenTOC(item.subitems, depth + 1));
        }
      });
      return result;
    };

    return flattenTOC(toc);
  }, [toc, expandedItems]);
};

const TOCView: React.FC<{
  bookKey: string;
  toc: TOCItem[];
}> = ({ bookKey, toc }) => {
  const { getView, getProgress, getViewSettings } = useReaderStore();
  const viewSettings = getViewSettings(bookKey);
  const progress = getProgress(bookKey);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [containerHeight, setContainerHeight] = useState(400);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const listOuterRef = useRef<HTMLDivElement | null>(null);
  const vitualListRef = useRef<VirtualList | null>(null);
  const staticListRef = useRef<HTMLDivElement | null>(null);

  const [initialize] = useOverlayScrollbars({
    defer: true,
    options: {
      scrollbars: {
        autoHide: 'scroll',
      },
      showNativeOverlaidScrollbars: false,
    },
    events: {
      initialized(osInstance) {
        const { viewport } = osInstance.elements();
        viewport.style.overflowX = `var(--os-viewport-overflow-x)`;
        viewport.style.overflowY = `var(--os-viewport-overflow-y)`;
      },
    },
  });

  useEffect(() => {
    const { current: root } = containerRef;
    const { current: virtualOuter } = listOuterRef;

    if (root && virtualOuter) {
      initialize({
        target: root,
        elements: {
          viewport: virtualOuter,
        },
      });
    }
  }, [initialize]);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const parentContainer = containerRef.current.closest('.scroll-container');
        if (parentContainer) {
          const parentRect = parentContainer.getBoundingClientRect();
          const availableHeight = parentRect.height - (rect.top - parentRect.top);
          setContainerHeight(Math.max(400, availableHeight));
        }
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      const parentContainer = containerRef.current.closest('.scroll-container');
      if (parentContainer) {
        resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(parentContainer);
      }
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [expandedItems]);

  const activeHref = useMemo(() => progress?.sectionHref || null, [progress?.sectionHref]);
  const flatItems = useFlattenedTOC(toc, expandedItems);
  const activeItemIndex = useMemo(() => {
    return flatItems.findIndex((item) => item.item.href === activeHref);
  }, [flatItems, activeHref]);

  const handleToggleExpand = useCallback((item: TOCItem) => {
    const href = item.href || '';
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  }, []);

  const handleItemClick = useCallback(
    async (item: TOCItem) => {
      console.group('🔍 TOC点击调试');
      console.log('点击的章节:', {
        label: item.label,
        href: item.href,
        bookKey: bookKey
      });
      
      try {
        // 1. 检查事件分发
        console.log('📤 分发导航事件...');
        await eventDispatcher.dispatch('navigate', { bookKey, href: item.href });
        console.log('✅ 导航事件分发成功');
        
        // 2. 检查视图获取
        const view = getView(bookKey);
        console.log('📖 获取视图:', {
          view: view ? '✅ 已找到视图' : '❌ 视图为null',
          bookKey: bookKey,
          viewType: view ? (view.constructor.name || 'Unknown') : 'N/A'
        });
        
        if (item.href) {
          if (view) {
            // 3. 检查goTo方法
            console.log('🧭 调用goTo方法...');
            console.log('目标href:', item.href);
            
            if (typeof view.goTo === 'function') {
              try {
                await view.goTo(item.href);
                console.log('✅ goTo方法调用成功');
              } catch (goToError) {
                console.error('❌ goTo方法执行失败:', goToError);
              }
            } else {
              console.error('❌ view.goTo 不是一个函数:', typeof view.goTo);
            }
          } else {
            console.error('❌ 无法获取视图 - 可能的原因:');
            console.error('1. bookKey不匹配');
            console.error('2. 视图还未初始化');
            console.error('3. 视图初始化失败');
            
            // 调试store状态 - 使用当前组件的store访问方式
            console.log('🔍 当前bookKey:', bookKey);
            console.log('🔍 尝试重新获取视图...');
            // 短暂延迟后重试
            setTimeout(() => {
              const retryView = getView(bookKey);
              console.log('🔍 重试结果:', retryView ? '找到视图' : '仍然为null');
            }, 100);
          }
        } else {
          console.warn('⚠️ 章节没有href');
        }
        
      } catch (error) {
        console.error('❌ TOC点击处理失败:', error);
      } finally {
        console.groupEnd();
      }
    },
    [bookKey, getView],
  );

  const expandParents = useCallback((toc: TOCItem[], href: string) => {
    const parentPath = findParentPath(toc, href).map((item) => item.href);
    const parentHrefs = parentPath.filter(Boolean) as string[];
    setExpandedItems(new Set(parentHrefs));
  }, []);

  const scrollToActiveItem = useCallback(() => {
    if (!activeHref) return;

    if (vitualListRef.current) {
      const activeIndex = flatItems.findIndex((flatItem) => flatItem.item.href === activeHref);
      if (activeIndex !== -1) {
        vitualListRef.current.scrollToItem(activeIndex, 'center');
      }
    }

    if (staticListRef.current) {
      const hrefMd5 = activeHref ? getContentMd5(activeHref) : '';
      const activeItem = staticListRef.current?.querySelector(`[data-href="${hrefMd5}"]`);
      if (activeItem) {
        const rect = activeItem.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!isVisible) {
          (activeItem as HTMLElement).scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        (activeItem as HTMLElement).setAttribute('aria-current', 'page');
      }
    }
  }, [activeHref, flatItems]);

  const virtualItemSize = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 640 ? 37 : 57;
  }, []);

  const virtualListData = useMemo(
    () => ({
      flatItems,
      itemSize: virtualItemSize,
      bookKey,
      activeHref,
      onToggleExpand: handleToggleExpand,
      onItemClick: handleItemClick,
    }),
    [flatItems, virtualItemSize, bookKey, activeHref, handleToggleExpand, handleItemClick],
  );

  useEffect(() => {
    if (!progress) return;

    const { sectionHref: currentHref } = progress;
    if (currentHref) {
      expandParents(toc, currentHref);
    }
  }, [toc, progress, bookKey, expandParents]);

  useEffect(() => {
    if (flatItems.length > 0) {
      setTimeout(scrollToActiveItem, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatItems, scrollToActiveItem]);

  return flatItems.length > 256 ? (
    <div
      className='virtual-list rounded pt-2'
      data-overlayscrollbars-initialize=''
      ref={containerRef}
    >
      <VirtualList
        ref={vitualListRef}
        outerRef={listOuterRef}
        width='100%'
        height={containerHeight}
        itemCount={flatItems.length}
        itemSize={virtualItemSize}
        itemData={virtualListData}
        overscanCount={20}
        initialScrollOffset={
          activeItemIndex >= 0
            ? Math.max(0, activeItemIndex * virtualItemSize - containerHeight / 2)
            : undefined
        }
      >
        {VirtualListRow}
      </VirtualList>
    </div>
  ) : (
    <div className='static-list rounded pt-2' ref={staticListRef}>
      {flatItems.map((flatItem, index) => (
        <StaticListRow
          key={`static-row-${index}`}
          bookKey={bookKey}
          flatItem={flatItem}
          activeHref={activeHref}
          onToggleExpand={handleToggleExpand}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  );
};
export default TOCView; 