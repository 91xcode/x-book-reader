import { useReaderStore } from '@/store/readerStore';
import { FoliateView } from '@/types/view';
import { ViewSettings } from '@/types/book';

export const viewPagination = (
  view: FoliateView | null,
  viewSettings: ViewSettings | null | undefined,
  side: 'left' | 'right',
) => {
  if (!view || !viewSettings) return;
  const renderer = view.renderer;
  if (renderer.scrolled) {
    // 滚动模式下的分页逻辑
    const { size } = renderer;
    const showHeader = viewSettings.showHeader && viewSettings.showBarsOnScroll;
    const showFooter = viewSettings.showFooter && viewSettings.showBarsOnScroll;
    const scrollingOverlap = viewSettings.scrollingOverlap || 0;
    const distance = size - scrollingOverlap - (showHeader ? 44 : 0) - (showFooter ? 44 : 0);
    return side === 'left' ? view.prev(distance) : view.next(distance);
  } else {
    // 分页模式下的分页逻辑
    return side === 'left' ? view.goLeft() : view.goRight();
  }
};

export const usePagination = (bookKey: string) => {
  const { getView, getViewSettings } = useReaderStore();

  const goLeft = () => {
    const viewSettings = getViewSettings(bookKey);
    const view = getView(bookKey);
    viewPagination(view, viewSettings, 'left');
  };

  const goRight = () => {
    const viewSettings = getViewSettings(bookKey);
    const view = getView(bookKey);
    viewPagination(view, viewSettings, 'right');
  };

  const goPrev = () => {
    const view = getView(bookKey);
    const viewSettings = getViewSettings(bookKey);
    if (view && viewSettings) {
      const fontSize = viewSettings.defaultFontSize || 16;
      const lineHeight = viewSettings.lineHeight || 1.6;
      const distance = fontSize * lineHeight * 3;
      view.prev(distance);
    }
  };

  const goNext = () => {
    const view = getView(bookKey);
    const viewSettings = getViewSettings(bookKey);
    if (view && viewSettings) {
      const fontSize = viewSettings.defaultFontSize || 16;
      const lineHeight = viewSettings.lineHeight || 1.6;
      const distance = fontSize * lineHeight * 3;
      view.next(distance);
    }
  };

  const goPrevSection = () => {
    const view = getView(bookKey);
    if (view?.renderer?.prevSection) {
      view.renderer.prevSection();
    }
  };

  const goNextSection = () => {
    const view = getView(bookKey);
    if (view?.renderer?.nextSection) {
      view.renderer.nextSection();
    }
  };

  const goBack = () => {
    const view = getView(bookKey);
    view?.history?.back?.();
  };

  const goForward = () => {
    const view = getView(bookKey);
    view?.history?.forward?.();
  };

  return {
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