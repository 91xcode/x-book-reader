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
    safeSetStylesImportant?: (el: any, styles: any) => void;
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

  // 🎯 安全配置渲染器属性的函数
  const configureRenderer = (view: FoliateView, settings: ViewSettings) => {
    // 确保renderer存在且view已完全初始化
    if (!view.renderer || !view.book) {
      console.warn('Renderer or book not ready, skipping configuration');
      return;
    }

    const animated = settings.animated!;
    const maxColumnCount = settings.maxColumnCount!;
    const maxInlineSize = settings.maxInlineSize || 720;
    const maxBlockSize = settings.maxBlockSize || 1440;

    try {
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
    } catch (error) {
      console.error('Error configuring renderer:', error);
    }
  };

  // 🎯 安全应用边距和间距的函数
  const applyMarginAndGap = (view: FoliateView, settings: ViewSettings) => {
    const { renderer } = view;
    if (!renderer || !renderer.setAttribute) {
      console.warn('Renderer not available for margin/gap configuration');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error applying margin and gap:', error);
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

  // 🔥 重构后的文档加载处理器 - 遵循readest风格 + 增强元素安全检查
  const docLoadHandler = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    console.log('doc index loaded:', detail.index);
    
    // 🔑 重要：添加更严格的文档和元素存在检查
    if (!detail.doc || !detail.doc.documentElement) {
      console.warn('⚠️ Document or documentElement not available, skipping doc load handling');
      return;
    }
    
    try {
      // 🔧 修复文档中的语言属性，防止TTS Segmenter错误
      const fixLanguageAttributes = (doc: Document) => {
        // 修复documentElement的lang属性
        if (doc.documentElement.lang === 'auto' || !doc.documentElement.lang) {
          const validLang = bookDoc.metadata?.language && bookDoc.metadata.language !== 'auto' 
            ? bookDoc.metadata.language 
            : 'zh-CN';
          doc.documentElement.lang = validLang;
          console.log('Fixed documentElement lang to:', validLang);
        }
        
        // 修复所有带有lang="auto"的元素
        const autoLangElements = doc.querySelectorAll('[lang="auto"]');
        autoLangElements.forEach(el => {
          const validLang = bookDoc.metadata?.language && bookDoc.metadata.language !== 'auto' 
            ? bookDoc.metadata.language 
            : 'zh-CN';
          (el as HTMLElement).lang = validLang;
        });
        
        // 修复所有带有xml:lang="auto"的元素
        const autoXmlLangElements = doc.querySelectorAll('[xml\\:lang="auto"]');
        autoXmlLangElements.forEach(el => {
          const validLang = bookDoc.metadata?.language && bookDoc.metadata.language !== 'auto' 
            ? bookDoc.metadata.language 
            : 'zh-CN';
          el.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang', validLang);
        });
      };
      
      // 立即修复语言属性
      fixLanguageAttributes(detail.doc);
      
      // 🧭 方向检测和设置
      const writingDir = viewRef.current?.renderer?.setStyles && getDirection(detail.doc);
      const currentViewSettings = getViewSettings(bookKey)!;
      
      currentViewSettings.vertical = writingDir?.vertical || currentViewSettings.writingMode.includes('vertical');
      currentViewSettings.rtl = writingDir?.rtl || currentViewSettings.writingMode.includes('rtl');
      setViewSettings(bookKey, { ...currentViewSettings });

      // 🎨 关键：挂载额外字体 - 暂时使用bookDoc的语言信息
      if (detail.doc.head) {
        mountAdditionalFonts(detail.doc, isCJKLang(bookDoc.metadata?.language));
      }

      // 📱 预分页布局处理 - 添加额外的安全检查
      if (bookDoc.rendition?.layout === 'pre-paginated') {
        // 🔑 双重检查：确保所有必要元素都存在
        if (detail.doc.documentElement && detail.doc.body) {
          applyFixedlayoutStyles(detail.doc, currentViewSettings);
        } else {
          console.warn('⚠️ Document elements not ready for fixed layout, delaying...');
          // 延迟重试机制
          setTimeout(() => {
            if (detail.doc?.documentElement && detail.doc?.body) {
              try {
                applyFixedlayoutStyles(detail.doc, currentViewSettings);
                console.log('✅ Fixed layout styles applied after delay');
              } catch (retryError) {
                console.error('❌ Fixed layout styles failed after retry:', retryError);
              }
            }
          }, 150);
        }
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
    } catch (error) {
      console.error('❌ Error in docLoadHandler:', error);
      // 不抛出错误，确保不影响其他文档的加载
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

    // 🚀 简化的openBook函数
    const openBook = async () => {
      // 🔑 重要：在导入foliate-js之前添加安全补丁
      const originalConsoleError = console.error;
      
      // 动态导入 foliate-js/view.js
      await import('foliate-js/view.js');
      
      // 🔑 猴子补丁：保护setStylesImportant函数和相关操作
      if (typeof window !== 'undefined') {
        // 1. 拦截CSS setProperty调用
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
        CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
          try {
            return originalSetProperty.call(this, property, value, priority);
          } catch (error) {
            console.warn('⚠️ Safe CSS setProperty error intercepted:', error);
            return;
          }
        };
        
        // 2. 创建全局的安全setStylesImportant函数
        if (!window.safeSetStylesImportant) {
          window.safeSetStylesImportant = (el: any, styles: any) => {
            try {
              if (!el || !el.style) {
                console.warn('⚠️ Invalid element for setStylesImportant, skipping');
                return;
              }
              
              const { style } = el;
              for (const [k, v] of Object.entries(styles)) {
                if (style && typeof style.setProperty === 'function') {
                  style.setProperty(k, v, 'important');
                }
              }
            } catch (error) {
              console.warn('⚠️ Safe setStylesImportant error intercepted:', error);
            }
          };
        }
        
        // 3. 拦截可能的element访问
        const originalQuerySelector = Document.prototype.querySelector;
        Document.prototype.querySelector = function(selectors: string) {
          try {
            return originalQuerySelector.call(this, selectors);
          } catch (error) {
            console.warn('⚠️ Safe querySelector error intercepted:', error);
            return null;
          }
        };
      }
      
      // 创建 foliate-view 元素
      const view = wrappedFoliateView(document.createElement('foliate-view') as FoliateView);
      view.id = `foliate-view-${bookKey}`;
      
      // 添加TTS所需的属性
      view.setAttribute('data-foliate-view', '');
      (view as any).view = view; // 为TTSControl提供view对象访问
      
      // 添加到 DOM
      document.body.append(view);
      containerRef.current?.appendChild(view);

      // 设置书籍方向配置
      const viewSettings = getViewSettings(bookKey) || DEFAULT_VIEW_SETTINGS;
      const writingMode = viewSettings.writingMode;
      if (writingMode && writingMode !== 'auto') {
        if (writingMode.includes('vertical')) {
          bookDoc.dir = writingMode.includes('rl') ? 'rtl' : 'ltr';
        }
      }

      // 修复书籍语言标签
      if (bookDoc.metadata?.language === 'auto' || !bookDoc.metadata?.language) {
        const needsCJK = isCJKLang(bookDoc.metadata?.language);
        bookDoc.metadata = {
          ...bookDoc.metadata,
          language: needsCJK ? 'zh-CN' : 'en'
        };
      }

      // 打开书籍并等待完成
      await view.open(bookDoc);
      
      // 确保view的语言设置也被正确更新（防止Segmenter错误）
      if (view.language) {
        const validLanguage = bookDoc.metadata?.language || 'zh-CN';
        if (validLanguage !== 'auto') {
          view.language.locale = validLanguage;
        } else {
          view.language.locale = 'zh-CN';
        }
        console.log('View language set to:', view.language);
      }
      
      // 确保view完全初始化后再进行后续操作
      viewRef.current = view;
      setFoliateView(bookKey, view);

      const { book } = view;

      // 等待一小段时间确保所有内部初始化完成
      await new Promise(resolve => setTimeout(resolve, 50));

      // 🎤 初始化TTS功能 - 延迟一点确保所有渲染完成
      setTimeout(async () => {
        try {
          await view.initTTS();
          console.log('✅ TTS initialized successfully for view');
        } catch (error) {
          console.warn('⚠️ TTS initialization failed:', error);
        }
      }, 500);

      // 📐 配置视图尺寸和转换处理器
      if (book.transformTarget) {
        book.transformTarget.addEventListener('load', (event: Event) => {
          const { detail } = event as CustomEvent;
          if (detail.isScript) {
            detail.allowScript = viewSettings.allowScript ?? false;
          }
        });
        
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        const width = viewWidth - insets.left - insets.right;
        const height = viewHeight - insets.top - insets.bottom;
        book.transformTarget.addEventListener('data', getDocTransformHandler({ width, height }));
      }

      // 🎨 应用样式前检查renderer是否准备好
      if (view.renderer?.setStyles) {
        view.renderer.setStyles(getCompleteStyles(viewSettings));
      }

      // 🏷️ 安全配置渲染器属性
      configureRenderer(view, viewSettings);

      // 📍 导航到位置 (lastLocation 或 fraction 0)
      const lastLocation = config.location;
      try {
        if (lastLocation) {
          await view.init({ lastLocation });
        } else {
          await view.goToFraction(0);
        }
      } catch (error) {
        console.warn('Navigation failed, falling back to start:', error);
        // 如果导航失败，尝试简单的开始位置
        try {
          await view.goToFraction(0);
        } catch (fallbackError) {
          console.error('Fallback navigation also failed:', fallbackError);
        }
      }


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

  // 🎯 监听特定viewSettings变化 - 完全遵循readest模式 + 错误处理
  useEffect(() => {
    if (viewRef.current && viewRef.current.renderer && viewRef.current.book) {
      const viewSettings = getViewSettings(bookKey);
      if (!viewSettings) return;

      try {
        // 安全应用样式
        if (viewRef.current.renderer.setStyles) {
          viewRef.current.renderer.setStyles(getCompleteStyles(viewSettings));
        }
        
        // 📄 预分页布局特殊处理
        if (bookDoc.rendition?.layout === 'pre-paginated') {
          try {
            const docs = viewRef.current.renderer.getContents?.();
            if (docs && Array.isArray(docs)) {
              docs.forEach(({ doc }) => {
                if (doc && doc.documentElement) {
                  applyFixedlayoutStyles(doc, viewSettings);
                }
              });
            }
          } catch (layoutError) {
            console.warn('Error applying fixed layout styles:', layoutError);
          }
        }
      } catch (error) {
        console.error('Error updating view settings:', error);
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