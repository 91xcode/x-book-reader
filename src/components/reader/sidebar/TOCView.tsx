import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { TOCItem } from '@/types/book';
import { useReaderStore } from '@/store/readerStore';
import { eventDispatcher } from '@/utils/event';
import TOCItemView from './TOCItem';

interface FlatTOCItem {
  item: TOCItem;
  level: number;
}

const TOCView: React.FC<{
  bookKey: string;
  toc: TOCItem[];
}> = ({ bookKey, toc }) => {
  const { getView, getProgress } = useReaderStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const staticListRef = useRef<HTMLDivElement>(null);
  const vitualListRef = useRef<any>(null);

  const progress = getProgress(bookKey);

  // 展开所有父级项目
  const useFlattenedTOC = (toc: TOCItem[], expandedItems: Set<string>): FlatTOCItem[] => {
    const flattened: FlatTOCItem[] = [];
    
    const flatten = (items: TOCItem[], level: number = 0) => {
      items.forEach((item) => {
        flattened.push({ item, level });
        
        if (item.subitems && item.subitems.length > 0) {
          const isExpanded = expandedItems.has(item.href || '');
          if (isExpanded) {
            flatten(item.subitems, level + 1);
          }
        }
      });
    };
    
    flatten(toc);
    return flattened;
  };

  // 查找父级路径
  const findParentPath = (toc: TOCItem[], targetHref: string): TOCItem[] => {
    const path: TOCItem[] = [];
    
    const search = (items: TOCItem[]): boolean => {
      for (const item of items) {
        path.push(item);
        
        if (item.href === targetHref) {
          return true;
        }
        
        if (item.subitems && search(item.subitems)) {
          return true;
        }
        
        path.pop();
      }
      
      return false;
    };
    
    search(toc);
    return path;
  };

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
    (item: TOCItem) => {
      eventDispatcher.dispatch('navigate', { bookKey, href: item.href });
      if (item.href) {
        getView(bookKey)?.goTo(item.href);
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
      const activeItem = staticListRef.current?.querySelector(`[data-href="${activeHref}"]`);
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

  // 自动展开到当前活动项目
  useEffect(() => {
    if (activeHref && toc.length > 0) {
      expandParents(toc, activeHref);
    }
  }, [activeHref, toc, expandParents]);

  // 滚动到活动项目
  useEffect(() => {
    scrollToActiveItem();
  }, [scrollToActiveItem]);

  if (!toc || toc.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-base-content/60 mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-base-300 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">无目录信息</h3>
          <p className="text-sm">该书籍暂无目录结构</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="toc-view h-full">
      <OverlayScrollbarsComponent
        className="h-full"
        options={{
          scrollbars: { autoHide: 'scroll' },
          showNativeOverlaidScrollbars: false
        }}
        defer
      >
        <div ref={staticListRef} className="px-4 py-2">
          {flatItems.map((flatItem, index) => (
            <TOCItemView
              key={`${flatItem.item.href}-${index}`}
              flatItem={flatItem}
              isActive={flatItem.item.href === activeHref}
              onToggleExpand={handleToggleExpand}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default TOCView; 