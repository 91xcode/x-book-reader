import React, { useEffect, useRef, useState } from 'react';
import { BookDoc } from '@/libs/document';
import { BookConfig } from '@/types/book';
import { FoliateView, wrappedFoliateView } from '@/types/view';
import { useReaderStore } from '@/store/readerStore';
import { useFoliateEvents } from '../../hooks/useFoliateEvents';
import { useProgressSync } from '../../hooks/useProgressSync';
import { useProgressAutoSave } from '../../hooks/useProgressAutoSave';
import { getStyles } from '@/utils/style';

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
  const { getViewSettings, setViewSettings } = useReaderStore();
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

  const docLoadHandler = (event: Event) => {
    const { detail } = event as CustomEvent;
    if (detail.isScript) {
      detail.allowScript = viewSettings?.allowScript ?? false;
    }
  };

  const getDocTransformHandler = ({ width, height }: { width: number; height: number }) => {
    return (event: Event) => {
      const { detail } = event as CustomEvent;
      console.log('Document transform', { width, height, detail });
    };
  };

  const applyMarginAndGap = () => {
    if (!viewRef.current || !viewRef.current.renderer || !viewSettings) return;

    const { renderer } = viewRef.current;
    const margin = `${insets.top}px ${insets.right}px ${insets.bottom}px ${insets.left}px`;
    renderer.setAttribute('margin', margin);

    if (viewSettings.gapPercent) {
      renderer.setAttribute('gap', `${viewSettings.gapPercent}%`);
    }
  };

  useFoliateEvents(viewRef.current, {
    onRelocate: progressRelocateHandler,
    onLoad: docLoadHandler,
  });

  useEffect(() => {
    if (isViewCreated.current) return;
    isViewCreated.current = true;

    const openBook = async () => {
      console.log('Opening book', bookKey);
      
      // 动态导入foliate-js
      await import('foliate-js/view.js');
      
      // 创建foliate-view元素
      const view = wrappedFoliateView(document.createElement('foliate-view') as FoliateView);
      view.id = `foliate-view-${bookKey}`;
      document.body.append(view);
      containerRef.current?.appendChild(view);

      // 设置视图设置
      const currentViewSettings = getViewSettings(bookKey)!;
      
      // 确定文档方向
      if (currentViewSettings.writingMode) {
        const writingMode = currentViewSettings.writingMode;
        if (writingMode !== 'auto') {
          bookDoc.dir = writingMode === 'vertical-rl' ? 'rtl' : 'ltr';
        }
      }

      // 打开书籍
      await view.open(bookDoc);
      
      // 设置引用
      viewRef.current = view;
      setFoliateView(bookKey, view);

      const { book } = view;

      // 监听文档加载事件
      book.transformTarget?.addEventListener('load', docLoadHandler);
      
      // 计算视图尺寸
      const viewWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const viewHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      const width = viewWidth - insets.left - insets.right;
      const height = viewHeight - insets.top - insets.bottom;
      
      // 设置文档转换处理器
      book.transformTarget?.addEventListener('data', getDocTransformHandler({ width, height }));
      
      // 应用样式
      view.renderer.setStyles?.(getStyles(currentViewSettings));

      // 配置视图参数
      const animated = currentViewSettings.animated ?? true;
      const maxColumnCount = currentViewSettings.maxColumnCount ?? 2;
      const maxInlineSize = currentViewSettings.maxInlineSize ?? 720;
      const maxBlockSize = currentViewSettings.maxBlockSize ?? 1440;
      const gapPercent = currentViewSettings.gapPercent ?? 3.33;
      const marginTopPx = currentViewSettings.marginTopPx ?? 48;
      const marginBottomPx = currentViewSettings.marginBottomPx ?? 48;
      const marginLeftPx = currentViewSettings.marginLeftPx ?? 48;
      const marginRightPx = currentViewSettings.marginRightPx ?? 48;

      // 设置渲染器属性
      view.renderer.setAttribute('flow', currentViewSettings.scrolled ? 'scrolled' : 'paginated');
      view.renderer.setAttribute('animated', animated.toString());
      view.renderer.setAttribute('max-column-count', maxColumnCount.toString());
      view.renderer.setAttribute('max-inline-size', maxInlineSize.toString());
      view.renderer.setAttribute('max-block-size', maxBlockSize.toString());
      view.renderer.setAttribute('gap', `${gapPercent}%`);

      // 应用边距和间距
      applyMarginAndGap();

      // 如果有保存的位置，跳转到该位置
      if (config.location) {
        view.goTo(config.location);
      }

      console.log('Book opened successfully', bookKey);
    };

    openBook().catch(console.error);

    return () => {
      if (viewRef.current) {
        viewRef.current.close();
        viewRef.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookKey, bookDoc]);

  // 当视图设置改变时更新样式
  useEffect(() => {
    if (viewRef.current && viewRef.current.renderer && viewSettings) {
      viewRef.current.renderer.setStyles?.(getStyles(viewSettings));
    }
  }, [viewSettings]);

  // 当insets改变时更新边距和间距
  useEffect(() => {
    if (viewRef.current && viewRef.current.renderer && viewSettings) {
      applyMarginAndGap();
    }
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