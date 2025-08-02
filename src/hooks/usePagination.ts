import React from 'react';
import { useReaderStore } from '@/store/readerStore';
import { ViewSettings } from '@/types/book';
import { FoliateView } from '@/types/view';
import { calculateScrollDistance } from '@/utils/config';

// 🎯 readest风格的viewPagination函数
export const viewPagination = (
  view: FoliateView | null,
  viewSettings: ViewSettings | null | undefined,
  side: 'left' | 'right',
) => {
  console.log('🔄 viewPagination调用:', {
    view: view ? '✅ 存在' : '❌ null',
    viewSettings: viewSettings ? '✅ 存在' : '❌ null',
    side,
    animated: viewSettings?.animated
  });
  
  if (!view || !viewSettings) {
    console.warn('❌ viewPagination: view或viewSettings为空');
    return;
  }
  const renderer = view.renderer;
  
  if (renderer.scrolled) {
    if (view.book.dir === 'rtl') {
      side = side === 'left' ? 'right' : 'left';
    }
    
    // 🎯 使用readest的距离计算逻辑
    const distance = calculateScrollDistance(renderer, viewSettings);
    console.log('📜 滚动模式翻页:', { side, distance });
    return side === 'left' ? view.prev(distance) : view.next(distance);
  } else {
    console.log('📖 分页模式翻页:', { side, animated: viewSettings.animated });
    return side === 'left' ? view.goLeft() : view.goRight();
  }
};

export const usePagination = (
  bookKey: string,
  viewRef?: React.MutableRefObject<FoliateView | null>,
  containerRef?: React.RefObject<HTMLDivElement>,
) => {
  const { getViewSettings, getView, setHoveredBookKey, getHoveredBookKey } = useReaderStore();

  // Get view either from ref or store
  const getCurrentView = () => viewRef?.current || getView(bookKey);

  const handlePageFlip = async (
    msg: MessageEvent | CustomEvent | React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (msg instanceof MessageEvent) {
      if (msg.data && msg.data.bookKey === bookKey) {
        const viewSettings = getViewSettings(bookKey)!;
        
        if (msg.data.type === 'iframe-single-click') {
          const viewElement = containerRef?.current;
          if (viewElement) {
            const { screenX } = msg.data;
            const viewRect = viewElement.getBoundingClientRect();
            
            // 🎯 readest风格：平台适配的窗口位置计算
            let windowStartX = 0;
            try {
              // 在某些平台上，window.screenX可能不可用
              if (typeof window !== 'undefined' && typeof window.screenX === 'number') {
                windowStartX = window.screenX;
              }
            } catch (error) {
              console.warn('无法获取窗口位置，使用默认值:', error);
            }
            
            const viewStartX = windowStartX + viewRect.left;
            const viewCenterX = viewStartX + viewRect.width / 2;
            
            const centerStartX = viewStartX + viewRect.width * 0.375;
            const centerEndX = viewStartX + viewRect.width * 0.625;
            
            if (
              viewSettings.disableClick! ||
              (screenX >= centerStartX && screenX <= centerEndX)
            ) {
              // 🎯 readest风格：切换header和footer的可见性
              const currentHovered = getHoveredBookKey();
              setHoveredBookKey(currentHovered ? null : bookKey);
            } else {
              // 🎯 readest风格：点击其他区域时隐藏工具栏
              const currentHovered = getHoveredBookKey();
              if (currentHovered) {
                setHoveredBookKey(null);
                return;
              }
              console.log('🖱️ 点击翻页区域:', {
                screenX,
                viewCenterX,
                isRightSide: screenX >= viewCenterX,
                swapClickArea: viewSettings.swapClickArea,
                disableClick: viewSettings.disableClick
              });
              
              if (!viewSettings.disableClick! && screenX >= viewCenterX) {
                const direction = viewSettings.swapClickArea ? 'left' : 'right';
                console.log('➡️ 点击右侧，方向:', direction);
                viewPagination(getCurrentView(), viewSettings, direction);
              } else if (!viewSettings.disableClick! && screenX < viewCenterX) {
                const direction = viewSettings.swapClickArea ? 'right' : 'left';
                console.log('⬅️ 点击左侧，方向:', direction);
                viewPagination(getCurrentView(), viewSettings, direction);
              }
            }
          }
        } else if (msg.data.type === 'iframe-wheel' && !viewSettings.scrolled) {
          // 滚动模式下wheel事件由iframe自己处理
          const { deltaY } = msg.data;
          if (deltaY > 0) {
            getCurrentView()?.next(1);
          } else if (deltaY < 0) {
            getCurrentView()?.prev(1);
          }
        } else if (msg.data.type === 'iframe-mouseup') {
          if (msg.data.button === 3) {
            getCurrentView()?.history.back();
          } else if (msg.data.button === 4) {
            getCurrentView()?.history.forward();
          }
        }
      }
    } else if (msg instanceof CustomEvent) {
      // 处理原生按键事件
      if (msg.detail.keyName === 'VolumeUp') {
        const viewSettings = getViewSettings(bookKey)!;
        if (viewSettings.volumeKeysToFlip) {
          viewPagination(getCurrentView(), viewSettings, 'left');
          return true;
        }
      } else if (msg.detail.keyName === 'VolumeDown') {
        const viewSettings = getViewSettings(bookKey)!;
        if (viewSettings.volumeKeysToFlip) {
          viewPagination(getCurrentView(), viewSettings, 'right');
          return true;
        }
      }
    }
    return false;
  };

  const handleContinuousScroll = (mode: 'mouse' | 'touch', scrollDelta: number, threshold: number) => {
    const renderer = getCurrentView()?.renderer;
    const viewSettings = getViewSettings(bookKey)!;
    
    if (renderer && viewSettings.scrolled && viewSettings.continuousScroll) {
      const doScroll = () => {
        // 🎯 readest风格：may have overscroll where the start is greater than 0
        if (renderer.start <= scrollDelta && scrollDelta > threshold) {
          setTimeout(() => {
            getCurrentView()?.prev(renderer.start + 1);
          }, 100);
          // 🎯 readest风格：sometimes viewSize has subpixel value that the end never reaches
        } else if (
          Math.ceil(renderer.end) - scrollDelta >= renderer.viewSize &&
          scrollDelta < -threshold
        ) {
          setTimeout(() => {
            getCurrentView()?.next(renderer.viewSize - Math.floor(renderer.end) + 1);
          }, 100);
        }
      };
      
      if (mode === 'mouse') {
        // 🎯 readest风格：we can always get mouse wheel events
        doScroll();
      } else if (mode === 'touch') {
        // 🎯 readest风格：when the document height is less than the viewport height, we can't get the relocate event
        if (renderer.size >= renderer.viewSize) {
          doScroll();
        } else {
          // 🎯 readest风格：scroll after the relocate event
          renderer.addEventListener('relocate', () => doScroll(), { once: true });
        }
      }
    }
  };

  // Navigation methods expected by FooterBar
  const goLeft = () => {
    const viewSettings = getViewSettings(bookKey);
    if (viewSettings) {
      viewPagination(getCurrentView(), viewSettings, 'left');
    }
  };

  const goRight = () => {
    const viewSettings = getViewSettings(bookKey);
    if (viewSettings) {
      viewPagination(getCurrentView(), viewSettings, 'right');
    }
  };

  const goPrev = () => {
    getCurrentView()?.prev();
  };

  const goNext = () => {
    getCurrentView()?.next();
  };

  const goPrevSection = () => {
    const view = getCurrentView();
    if (view && 'prevSection' in view && typeof (view as any).prevSection === 'function') {
      (view as any).prevSection();
    } else {
      // Fallback to previous page if section navigation not available
      view?.prev();
    }
  };

  const goNextSection = () => {
    const view = getCurrentView();
    if (view && 'nextSection' in view && typeof (view as any).nextSection === 'function') {
      (view as any).nextSection();
    } else {
      // Fallback to next page if section navigation not available
      view?.next();
    }
  };

  const goBack = () => {
    getCurrentView()?.history?.back();
  };

  const goForward = () => {
    getCurrentView()?.history?.forward();
  };

  return {
    handlePageFlip,
    handleContinuousScroll,
    goLeft,
    goRight,
    goPrev,
    goNext,
    goPrevSection,
    goNextSection,
    goBack,
    goForward,
  };
}; 