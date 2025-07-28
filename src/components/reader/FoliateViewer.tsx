import React, { useEffect, useRef, useState } from 'react';
import { BookDoc } from '@/libs/document';
import { BookConfig, ViewSettings } from '@/types/book';
import { FoliateView, wrappedFoliateView } from '@/types/view';
import { useReaderStore } from '@/store/readerStore';
import { useFoliateEvents } from '../../hooks/useFoliateEvents';
import { useProgressSync } from '../../hooks/useProgressSync';
import { useProgressAutoSave } from '../../hooks/useProgressAutoSave';
import { usePagination } from '../../hooks/usePagination';
import { getCompleteStyles, applyFixedlayoutStyles } from '@/utils/style';
import { DEFAULT_VIEW_SETTINGS } from '@/utils/constants';
import { useViewSettingsSync } from '@/utils/viewSettingsHelper';
import { mountAdditionalFonts } from '@/utils/font';
import { isCJKLang } from '@/utils/cjkDetection';
import { getDirection } from '@/utils/book';

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
  const { getViewSettings, setViewSettings, initializeViewSettings } = useReaderStore();
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

  // 🎯 集成readest风格的分页处理
  const { handlePageFlip, handleContinuousScroll } = usePagination(bookKey, viewRef, containerRef);

  // 🎯 立即配置渲染器属性的函数
  const configureRenderer = (view: FoliateView, settings: ViewSettings) => {
    const animated = settings.animated!;
    const maxColumnCount = settings.maxColumnCount!;
    const maxInlineSize = settings.maxInlineSize || 720;
    const maxBlockSize = settings.maxBlockSize || 1440;

    if (animated) {
      view.renderer.setAttribute('animated', '');
    } else {
      view.renderer.removeAttribute('animated');
    }
    view.renderer.setAttribute('max-column-count', maxColumnCount.toString());
    view.renderer.setAttribute('max-inline-size', `${maxInlineSize}px`);
    view.renderer.setAttribute('max-block-size', `${maxBlockSize}px`);
    
    // 🎯 应用边距和间距
    applyMarginAndGap(view, settings);
  };

  // 🎯 应用边距和间距的函数
  const applyMarginAndGap = (view: FoliateView, settings: ViewSettings) => {
    const { renderer } = view;
    renderer.setAttribute('margin-top', `${insets.top}px`);
    renderer.setAttribute('margin-right', `${insets.right}px`);
    renderer.setAttribute('margin-bottom', `${insets.bottom}px`);
    renderer.setAttribute('margin-left', `${insets.left}px`);
    
    if (settings.gapPercent) {
      renderer.setAttribute('gap', `${settings.gapPercent}%`);
    }
    
    if (settings.scrolled) {
      renderer.setAttribute('flow', 'scrolled');
    }
  };

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

  // 🔥 重构后的文档加载处理器 - 遵循readest风格
  const docLoadHandler = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    console.log('doc index loaded:', detail.index);
    
    if (detail.doc) {
      // 🧭 方向检测和设置
      const writingDir = viewRef.current?.renderer.setStyles && getDirection(detail.doc);
      const currentViewSettings = getViewSettings(bookKey)!;
      
      currentViewSettings.vertical = writingDir?.vertical || currentViewSettings.writingMode.includes('vertical');
      currentViewSettings.rtl = writingDir?.rtl || currentViewSettings.writingMode.includes('rtl');
      setViewSettings(bookKey, { ...currentViewSettings });

      // 🎨 关键：挂载额外字体 - 暂时使用bookDoc的语言信息
      mountAdditionalFonts(detail.doc, isCJKLang(bookDoc.metadata?.language));

      // 📱 预分页布局处理
      if (bookDoc.rendition?.layout === 'pre-paginated') {
        applyFixedlayoutStyles(detail.doc, currentViewSettings);
      }

      // 🖼️ 图片样式应用
      applyImageStyle(detail.doc, currentViewSettings);

      // 💻 脚本执行处理
      if (currentViewSettings.allowScript) {
        evalInlineScripts(detail.doc);
      }

      // 🎨 语法高亮
      if (currentViewSettings.codeHighlighting) {
        manageSyntaxHighlighting(detail.doc, currentViewSettings);
      }

      // 📄 添加事件监听器（如果尚未添加）
      if (!detail.doc.isEventListenersAdded) {
        detail.doc.isEventListenersAdded = true;
        // 这里可以添加键盘、鼠标、触摸事件监听器
        detail.doc.addEventListener('keydown', handleKeydown.bind(null, bookKey));
        detail.doc.addEventListener('mousedown', handleMousedown.bind(null, bookKey));
        detail.doc.addEventListener('mouseup', handleMouseup.bind(null, bookKey));
        detail.doc.addEventListener('click', handleClick.bind(null, bookKey));
        detail.doc.addEventListener('wheel', handleWheel.bind(null, bookKey));
        detail.doc.addEventListener('touchstart', handleTouchStart.bind(null, bookKey));
        detail.doc.addEventListener('touchmove', handleTouchMove.bind(null, bookKey));
        detail.doc.addEventListener('touchend', handleTouchEnd.bind(null, bookKey));
      }
    }
  };

  // 🖼️ 图片样式应用函数
  const applyImageStyle = (doc: Document, settings: ViewSettings) => {
    // 应用图片相关的样式设置
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      // 确保图片响应式
      if (!img.style.maxWidth) {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
      
      // 处理暗色模式下的图片
      if (settings.invertImgColorInDark && settings.theme === 'dark') {
        img.style.filter = 'invert(1)';
      }
    });
  };

  // 🎨 语法高亮管理函数
  const manageSyntaxHighlighting = (doc: Document, settings: ViewSettings) => {
    // 基础的语法高亮处理
    const codeBlocks = doc.querySelectorAll('pre, code');
    codeBlocks.forEach(block => {
      block.classList.add('syntax-highlighted');
    });
  };

  // 📄 事件处理函数（简化版）
  const handleKeydown = (bookKey: string, event: KeyboardEvent) => {
    // 键盘事件处理
    console.log('Key down in iframe:', event.key);
  };

  const handleMousedown = (bookKey: string, event: MouseEvent) => {
    // 鼠标按下事件处理
  };

  const handleMouseup = (bookKey: string, event: MouseEvent) => {
    // 鼠标释放事件处理
  };

  const handleClick = (bookKey: string, event: MouseEvent) => {
    // 点击事件处理
  };

  const handleWheel = (bookKey: string, event: WheelEvent) => {
    // 滚轮事件处理
  };

  const handleTouchStart = (bookKey: string, event: TouchEvent) => {
    // 触摸开始事件处理
  };

  const handleTouchMove = (bookKey: string, event: TouchEvent) => {
    // 触摸移动事件处理
  };

  const handleTouchEnd = (bookKey: string, event: TouchEvent) => {
    // 触摸结束事件处理
  };

  // 💻 内联脚本执行函数
  const evalInlineScripts = (doc: Document) => {
    if (doc.defaultView && doc.defaultView.frameElement) {
      const iframe = doc.defaultView.frameElement as HTMLIFrameElement;
      const scripts = doc.querySelectorAll('script:not([src])');
      scripts.forEach((script, index) => {
        const scriptContent = script.textContent || script.innerHTML;
        try {
          console.warn('Evaluating inline scripts in iframe');
          iframe.contentWindow?.eval(scriptContent);
        } catch (error) {
          console.error(`Error executing iframe script ${index + 1}:`, error);
        }
      });
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

  useEffect(() => {
    if (isViewCreated.current) return;
    isViewCreated.current = true;

    // 📚 readest风格的openBook函数
    const openBook = async () => {
      console.log('Opening book', bookKey);
      
      // 🔗 动态导入 foliate-js/view.js
      await import('foliate-js/view.js');
      
      // 🏗️ 创建 foliate-view 元素
      const view = wrappedFoliateView(document.createElement('foliate-view') as FoliateView);
      view.id = `foliate-view-${bookKey}`;
      
      // 📍 添加到 DOM (document.body + containerRef)
      document.body.append(view);
      containerRef.current?.appendChild(view);

      // ⚙️ 设置书籍方向配置
      const viewSettings = getViewSettings(bookKey) || DEFAULT_VIEW_SETTINGS;
      const writingMode = viewSettings.writingMode;
      if (writingMode && writingMode !== 'auto') {
        if (writingMode.includes('vertical')) {
          bookDoc.dir = writingMode.includes('rl') ? 'rtl' : 'ltr';
        }
      }

      // 🔧 验证和修复书籍语言标签
      if (bookDoc.metadata?.language === 'auto' || !bookDoc.metadata?.language) {
        console.warn('⚠️ 修复无效的语言标签:', bookDoc.metadata?.language);
        // 使用CJK检测结果或默认语言
        const needsCJK = isCJKLang(bookDoc.metadata?.language);
        bookDoc.metadata = {
          ...bookDoc.metadata,
          language: needsCJK ? 'zh-CN' : 'en'
        };
      }

      // 📖 await view.open(bookDoc)
      await view.open(bookDoc);
      
      // 🎯 立即设置引用和事件监听
      viewRef.current = view;
      
      // 🔍 调试：记录视图设置过程
      console.group('📖 FoliateViewer: 设置视图到store');
      console.log('设置bookKey:', bookKey);
      console.log('设置的view:', view);
      console.log('view类型:', view.constructor.name);
      
      setFoliateView(bookKey, view);
      
      // 验证设置是否成功
      setTimeout(() => {
        const retrievedView = getView(bookKey);
        console.log('验证设置结果:', {
          设置成功: retrievedView === view,
          retrievedView: retrievedView ? '存在' : 'null',
          原始view: view ? '存在' : 'null'
        });
        console.groupEnd();
      }, 10);

      const { book } = view;

      // 📐 配置视图尺寸和转换处理器
      book.transformTarget?.addEventListener('load', (event: Event) => {
        const { detail } = event as CustomEvent;
        if (detail.isScript) {
          detail.allowScript = viewSettings.allowScript ?? false;
        }
      });
      
      const viewWidth = window.innerWidth;
      const viewHeight = window.innerHeight;
      const width = viewWidth - insets.left - insets.right;
      const height = viewHeight - insets.top - insets.bottom;
      book.transformTarget?.addEventListener('data', getDocTransformHandler({ width, height }));

      // 🎨 立即应用样式: view.renderer.setStyles(getStyles(viewSettings))
      view.renderer.setStyles?.(getCompleteStyles(viewSettings));

      // 🏷️ 立即配置渲染器属性 (animated, column-count, etc.)
      configureRenderer(view, viewSettings);

      // 📍 导航到位置 (lastLocation 或 fraction 0)
      const lastLocation = config.location;
      if (lastLocation) {
        await view.init({ lastLocation });
      } else {
        await view.goToFraction(0);
      }

      console.log('✅ Book opened successfully with readest-style flow');
      
      // 🔍 最终验证：确认视图已正确设置
      console.group('🔍 FoliateViewer: 最终验证');
      console.log('bookKey:', bookKey);
      console.log('view已设置到store:', !!getView(bookKey));
      console.log('view类型:', view.constructor.name);
      console.log('view.goTo方法可用:', typeof view.goTo === 'function');
      console.groupEnd();
    };

    openBook().catch(error => {
      console.error('Error opening book:', error);
      isViewCreated.current = false; // 重置标志以便重试
    });

    // 🧹 清理函数
    return () => {
      if (viewRef.current) {
        try {
          // 清理事件监听器
          viewRef.current.book?.transformTarget?.removeEventListener('load', () => {});
          viewRef.current.book?.transformTarget?.removeEventListener('data', () => {});
          
          // 关闭并移除视图
          viewRef.current.close?.();
          viewRef.current.remove?.();
          viewRef.current = null;
        } catch (error) {
          console.error('Error cleaning up view:', error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🎯 添加分页事件监听
  useEffect(() => {
    // 监听来自iframe的消息（点击、滚轮等）
    window.addEventListener('message', handlePageFlip);

    return () => {
      window.removeEventListener('message', handlePageFlip);
    };
  }, [handlePageFlip]);

  // 🎯 监听特定viewSettings变化 - 完全遵循readest模式
  useEffect(() => {
    if (viewRef.current && viewRef.current.renderer) {
      const viewSettings = getViewSettings(bookKey)!;
      viewRef.current.renderer.setStyles?.(getCompleteStyles(viewSettings));
      
      // 📄 预分页布局特殊处理
      if (bookDoc.rendition?.layout === 'pre-paginated') {
        const docs = viewRef.current.renderer.getContents();
        docs.forEach(({ doc }) => applyFixedlayoutStyles(doc, viewSettings));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSettings?.theme, viewSettings?.overrideColor, viewSettings?.invertImgColorInDark]);

  return (
    <div 
      ref={containerRef} 
      className="foliate-viewer w-full h-full relative"
      style={{ 
        contain: 'layout style paint', // 🚀 性能优化：限制重排和重绘影响
        willChange: 'transform' // 🚀 提示浏览器优化变换
      }}
      onClick={handlePageFlip} // 🎯 添加点击事件处理
    >
      {toastMessage && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoliateViewer; 