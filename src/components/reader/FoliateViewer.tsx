import React, { useEffect, useRef, useState } from 'react';
import { BookDoc } from '@/libs/document';
import { BookConfig, ViewSettings } from '@/types/book';
import { FoliateView, wrappedFoliateView } from '@/types/view';
import { useReaderStore } from '@/store/readerStore';
import { useFoliateEvents } from '../../hooks/useFoliateEvents';
import { useProgressSync } from '../../hooks/useProgressSync';
import { useProgressAutoSave } from '../../hooks/useProgressAutoSave';
import { getCompleteStyles, applyFixedlayoutStyles } from '@/utils/style';
import { DEFAULT_VIEW_SETTINGS } from '@/utils/constants';
import { useViewSettingsSync } from '@/utils/viewSettingsHelper';

declare global {
  interface Window {
    eval(script: string): void;
  }
}

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const FoliateViewer: React.FC<{
  bookKey: string;
  bookDoc: BookDoc;
  config: BookConfig;
  contentInsets: Insets;
}> = ({ bookKey, bookDoc, config, contentInsets: insets }) => {
  const { getView, setView: setFoliateView, setProgress } = useReaderStore();
  const { getViewSettings, setViewSettings, initializeViewSettings, applyViewStyles } = useReaderStore();
  const { initializeBookSettings } = useViewSettingsSync();
  const viewSettings = getViewSettings(bookKey);

  const viewRef = useRef<FoliateView | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isViewCreated = useRef(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setToastMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useProgressSync(bookKey);
  useProgressAutoSave(bookKey);

  const progressRelocateHandler = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    
    // Debounce progress updates to prevent excessive calls
    const now = Date.now();
    const lastUpdate = (progressRelocateHandler as any).lastUpdate || 0;
    
    if (now - lastUpdate < 100) { // Limit to once per 100ms
      return;
    }
    
    (progressRelocateHandler as any).lastUpdate = now;
    
    setProgress(
      bookKey,
      detail.cfi,
      detail.tocItem,
      detail.section,
      detail.location,
      detail.time,
      detail.range,
    );
  };

  const getDocTransformHandler = ({ width, height }: { width: number; height: number }) => {
    return (event: Event) => {
      const { detail } = event as CustomEvent;
      detail.data = Promise.resolve(detail.data)
        .then((data) => {
          const viewSettings = getViewSettings(bookKey);
          if (viewSettings && detail.type === 'text/css')
            return data; // 让CSS保持原样，我们用setStyles处理
          return data;
        })
        .catch((e) => {
          console.error(`Failed to load ${detail.name}:`, e);
          return '';
        });
    };
  };

  // 🔥 关键修复：文档加载处理器
  const docLoadHandler = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    console.log('📄 文档加载完成:', detail.index);
    
    if (detail.doc && viewSettings) {
      // 基础处理：确保脚本执行权限
      if (detail.isScript) {
        detail.allowScript = viewSettings.allowScript ?? false;
      }
      
      // 预分页布局的特殊处理
      if (bookDoc.rendition?.layout === 'pre-paginated') {
        applyFixedlayoutStyles(detail.doc, viewSettings);
      }
    }
  };

  const docRelocateHandler = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (detail.reason !== 'scroll' && detail.reason !== 'page') return;
    console.log('Document relocate:', detail);
  };

  useFoliateEvents(viewRef.current, {
    onLoad: docLoadHandler,
    onRelocate: progressRelocateHandler,
    onRendererRelocate: docRelocateHandler,
  });

  const applyMarginAndGap = () => {
    const currentSettings = getViewSettings(bookKey);
    if (!viewRef.current || !viewRef.current.renderer || !currentSettings) return;

    const { renderer } = viewRef.current;
    const topMargin = insets.top;
    const rightMargin = insets.right;
    const bottomMargin = insets.bottom;
    const leftMargin = insets.left;

    renderer.setAttribute('margin-top', `${topMargin}px`);
    renderer.setAttribute('margin-right', `${rightMargin}px`);
    renderer.setAttribute('margin-bottom', `${bottomMargin}px`);
    renderer.setAttribute('margin-left', `${leftMargin}px`);
    
    if (currentSettings.gapPercent) {
      renderer.setAttribute('gap', `${currentSettings.gapPercent}%`);
    }
    
    if (currentSettings.scrolled) {
      renderer.setAttribute('flow', 'scrolled');
    }
  };

  useEffect(() => {
    console.log('=== FoliateViewer useEffect triggered ===');
    console.log('isViewCreated.current:', isViewCreated.current);
    console.log('bookKey:', bookKey);
    console.log('bookDoc:', bookDoc);
    
    if (isViewCreated.current) {
      console.log('View already created, skipping initialization');
      return;
    }
    
    console.log('Starting view creation...');
    isViewCreated.current = true;
    
    // Initialize view settings if not exists
    initializeBookSettings(bookKey, DEFAULT_VIEW_SETTINGS);

    const openBook = async () => {
      try {
        console.log('Opening book', bookKey);
        
        // 动态导入foliate-js
        await import('foliate-js/view.js');
        
        // 创建foliate-view元素
        const view = wrappedFoliateView(document.createElement('foliate-view') as FoliateView);
        view.id = `foliate-view-${bookKey}`;
        
        // 将视图添加到 DOM
        document.body.append(view);
        containerRef.current?.appendChild(view);

        // 设置视图设置
        const currentViewSettings = getViewSettings(bookKey);
        
        // 如果没有视图设置，使用默认设置
        if (!currentViewSettings) {
          console.warn('No view settings found for book:', bookKey);
          // 使用完整的默认设置，包含所有字体配置
          setViewSettings(bookKey, DEFAULT_VIEW_SETTINGS);
        }
        
        const finalViewSettings = getViewSettings(bookKey) || currentViewSettings!;
        
        // 确定文档方向
        if (finalViewSettings.writingMode) {
          const writingMode = finalViewSettings.writingMode;
          if (writingMode !== 'auto') {
            bookDoc.dir = writingMode === 'vertical-rl' ? 'rtl' : 'ltr';
          }
        }

        console.log('About to open book with:', { bookDoc, finalViewSettings });

        // 打开书籍 - 关键步骤
        await view.open(bookDoc);
        
        console.log('Book opened successfully, setting up view...');
        
        // 设置引用 - 在 open 之后立即设置
        viewRef.current = view;
        setFoliateView(bookKey, view);
        
        // Apply styles after view is ready (debounced)
        setTimeout(() => {
          applyViewStyles(bookKey);
        }, 200);

        const { book } = view;

        // 监听文档加载事件 - 在 open 之后设置
        book.transformTarget?.addEventListener('load', (event: Event) => {
          const { detail } = event as CustomEvent;
          if (detail.isScript) {
            detail.allowScript = finalViewSettings.allowScript ?? false;
          }
        });
        
        // 计算视图尺寸
        const viewWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const viewHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        const width = viewWidth - insets.left - insets.right;
        const height = viewHeight - insets.top - insets.bottom;
        
        // 设置文档转换处理器
        book.transformTarget?.addEventListener('data', getDocTransformHandler({ width, height }));
        
        // 等待一下再应用样式，确保视图已经准备好
        setTimeout(() => {
          try {
            console.log('Applying styles...');
            view.renderer.setStyles?.(getCompleteStyles(finalViewSettings));

            // 配置视图参数
            const animated = finalViewSettings.animated ?? true;
            const maxColumnCount = finalViewSettings.maxColumnCount ?? 2;
            const maxInlineSize = finalViewSettings.maxInlineSize ?? 720;
            const maxBlockSize = finalViewSettings.maxBlockSize ?? 1440;
            const gapPercent = finalViewSettings.gapPercent ?? 3.33;

            // 设置渲染器属性
            view.renderer.setAttribute('flow', finalViewSettings.scrolled ? 'scrolled' : 'paginated');
            if (animated) {
              view.renderer.setAttribute('animated', '');
            } else {
              view.renderer.removeAttribute('animated');
            }
            view.renderer.setAttribute('max-column-count', maxColumnCount.toString());
            view.renderer.setAttribute('max-inline-size', `${maxInlineSize}px`);
            view.renderer.setAttribute('max-block-size', `${maxBlockSize}px`);
            view.renderer.setAttribute('gap', `${gapPercent}%`);

            // 应用边距和间距
            applyMarginAndGap();

            console.log('Styles applied, initializing view...');

            // 初始化视图（关键步骤！）- 在所有设置都完成后执行
            const lastLocation = config.location;
            console.log('Config location:', lastLocation);
            
            try {
              if (lastLocation && typeof lastLocation === 'string') {
                console.log('Initializing with last location:', lastLocation);
                view.init({ lastLocation });
                console.log('View initialized with last location');
              } else {
                console.log('Initializing to beginning (fraction 0)');
                view.goToFraction(0);
                console.log('View initialized to beginning');
              }
            } catch (initError) {
              console.error('Error during view initialization:', initError);
              // 如果初始化失败，尝试从头开始
              try {
                view.goToFraction(0);
                console.log('Fallback: View initialized to beginning');
              } catch (fallbackError) {
                console.error('Error in fallback initialization:', fallbackError);
              }
            }

            console.log('Book opened and configured successfully', bookKey);
            console.log('=== FoliateViewer Ready ===');
          } catch (styleError) {
            console.error('Error applying styles:', styleError);
          }
        }, 100); // 给一点时间让视图准备好

      } catch (error) {
        console.error('Error opening book:', error);
        isViewCreated.current = false; // 重置标志以便重试
      }
    };

    openBook();

    return () => {
      if (viewRef.current) {
        try {
          viewRef.current.close();
          viewRef.current.remove();
        } catch (error) {
          console.error('Error cleaning up view:', error);
        }
      }
      
      // Clear any pending style application timeouts
      if ((globalThis as any).__styleApplyTimeout) {
        clearTimeout((globalThis as any).__styleApplyTimeout);
        delete (globalThis as any).__styleApplyTimeout;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookKey, bookDoc]);

  // 当主题和颜色设置改变时更新样式 (采用readest方式)
  useEffect(() => {
    if (!viewRef.current || !viewRef.current.renderer || !viewSettings) {
      console.log('📖 FoliateViewer: 跳过样式更新', {
        hasView: !!viewRef.current,
        hasRenderer: !!viewRef.current?.renderer,
        hasSettings: !!viewSettings
      });
      return;
    }
    
    console.log('🎨 FoliateViewer: 主题/颜色变化，重新应用样式');
    const styles = getCompleteStyles(viewSettings);
    viewRef.current.renderer.setStyles?.(styles);
    console.log('✅ FoliateViewer: 主题样式已应用到iframe');
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // 🔥 采用readest的精简依赖：只监听主题和颜色变化
    viewSettings?.theme,
    viewSettings?.overrideColor,
    viewSettings?.invertImgColorInDark,
  ]);

  // 当insets改变时更新边距和间距 (debounced)
  useEffect(() => {
    if (!viewRef.current || !viewRef.current.renderer || !viewSettings) return;
    
    const timeoutId = setTimeout(() => {
      if (viewRef.current && viewRef.current.renderer && viewSettings) {
        const { renderer } = viewRef.current;
        renderer.setAttribute('margin-top', `${insets.top}px`);
        renderer.setAttribute('margin-right', `${insets.right}px`);
        renderer.setAttribute('margin-bottom', `${insets.bottom}px`);
        renderer.setAttribute('margin-left', `${insets.left}px`);
        
        if (viewSettings.gapPercent) {
          renderer.setAttribute('gap', `${viewSettings.gapPercent}%`);
        }
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    insets.top,
    insets.right,
    insets.bottom,
    insets.left,
    viewSettings?.doubleBorder,
    viewSettings?.showHeader,
    viewSettings?.showFooter,
  ]);

  return (
    <div
      ref={containerRef}
      className='foliate-viewer h-[100%] w-[100%]'
    />
  );
};

export default FoliateViewer; 