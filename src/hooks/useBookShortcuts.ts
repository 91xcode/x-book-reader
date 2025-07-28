import { useEffect, useCallback } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { viewPagination } from './usePagination';
import { getMaxInlineSize } from '@/utils/config';
import { getCompleteStyles } from '@/utils/style';

interface UseBookShortcutsProps {
  sideBarBookKey: string | null;
  bookKeys: string[];
}

const useBookShortcuts = ({ sideBarBookKey, bookKeys }: UseBookShortcutsProps) => {
  const { getView, getViewSettings, setViewSettings } = useReaderStore();
  const viewSettings = getViewSettings(sideBarBookKey ?? '');
  const fontSize = viewSettings?.defaultFontSize ?? 16;
  const lineHeight = viewSettings?.lineHeight ?? 1.6;
  const distance = fontSize * lineHeight * 3;

  // 🎯 readest风格的滚动模式切换
  const toggleScrollMode = useCallback(() => {
    if (!sideBarBookKey) return;
    
    const viewSettings = getViewSettings(sideBarBookKey);
    if (viewSettings) {
      const updatedSettings = { ...viewSettings, scrolled: !viewSettings.scrolled };
      
      // 立即应用到renderer
      const view = getView(sideBarBookKey);
      const flowMode = updatedSettings.scrolled ? 'scrolled' : 'paginated';
      view?.renderer.setAttribute('flow', flowMode);
      view?.renderer.setAttribute(
        'max-inline-size', 
        `${getMaxInlineSize(updatedSettings)}px`
      );
      view?.renderer.setStyles?.(getCompleteStyles(updatedSettings));
      
      // 更新store
      setViewSettings(sideBarBookKey, updatedSettings);
      
      console.log(`🔄 快捷键切换滚动模式: ${updatedSettings.scrolled ? '滚动' : '分页'}`);
    }
  }, [sideBarBookKey, getView, getViewSettings, setViewSettings]);

  const switchSideBar = useCallback(() => {
    // TODO: 实现侧边栏切换逻辑
    console.log('🔄 切换侧边栏');
  }, []);

  const goLeft = useCallback(() => {
    if (!sideBarBookKey) return;
    const viewSettings = getViewSettings(sideBarBookKey);
    viewPagination(getView(sideBarBookKey), viewSettings, 'left');
  }, [sideBarBookKey, getView, getViewSettings]);

  const goRight = useCallback(() => {
    if (!sideBarBookKey) return;
    const viewSettings = getViewSettings(sideBarBookKey);
    viewPagination(getView(sideBarBookKey), viewSettings, 'right');
  }, [sideBarBookKey, getView, getViewSettings]);

  const goPrev = useCallback(() => {
    if (!sideBarBookKey) return;
    getView(sideBarBookKey)?.prev(distance);
  }, [sideBarBookKey, getView, distance]);

  const goNext = useCallback(() => {
    if (!sideBarBookKey) return;
    getView(sideBarBookKey)?.next(distance);
  }, [sideBarBookKey, getView, distance]);

  const goBack = useCallback(() => {
    if (!sideBarBookKey) return;
    getView(sideBarBookKey)?.history.back();
  }, [sideBarBookKey, getView]);

  const goHalfPageDown = useCallback(() => {
    if (!sideBarBookKey) return;
    const view = getView(sideBarBookKey);
    const viewSettings = getViewSettings(sideBarBookKey);
    if (view && viewSettings && viewSettings.scrolled) {
      view.next(view.renderer.size / 2);
    }
  }, [sideBarBookKey, getView, getViewSettings]);

  const goHalfPageUp = useCallback(() => {
    if (!sideBarBookKey) return;
    const view = getView(sideBarBookKey);
    const viewSettings = getViewSettings(sideBarBookKey);
    if (view && viewSettings && viewSettings.scrolled) {
      view.prev(view.renderer.size / 2);
    }
  }, [sideBarBookKey, getView, getViewSettings]);

  // 🎯 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!sideBarBookKey) return;
    
    // 避免在输入框中触发
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    const isMod = ctrlKey || metaKey; // Ctrl (Windows/Linux) or Cmd (Mac)

    switch (key) {
      case 's':
        if (isMod && !shiftKey && !altKey) {
          event.preventDefault();
          toggleScrollMode();
        }
        break;
      
      case 'ArrowLeft':
        if (!isMod && !shiftKey && !altKey) {
          event.preventDefault();
          goLeft();
        }
        break;
      
      case 'ArrowRight':
        if (!isMod && !shiftKey && !altKey) {
          event.preventDefault();
          goRight();
        }
        break;
      
      case 'ArrowUp':
        if (!isMod && !shiftKey && !altKey) {
          event.preventDefault();
          goPrev();
        }
        break;
      
      case 'ArrowDown':
        if (!isMod && !shiftKey && !altKey) {
          event.preventDefault();
          goNext();
        }
        break;
      
      case 'PageUp':
        event.preventDefault();
        goHalfPageUp();
        break;
      
      case 'PageDown':
        event.preventDefault();
        goHalfPageDown();
        break;
      
      case 'Home':
        if (isMod) {
          event.preventDefault();
          getView(sideBarBookKey)?.goToFraction(0);
        }
        break;
      
      case 'End':
        if (isMod) {
          event.preventDefault();
          getView(sideBarBookKey)?.goToFraction(1);
        }
        break;
      
      case 'Backspace':
        if (!isMod && !shiftKey && !altKey) {
          event.preventDefault();
          goBack();
        }
        break;
      
      case 'Tab':
        if (!isMod && !shiftKey && !altKey) {
          event.preventDefault();
          switchSideBar();
        }
        break;
    }
  }, [
    sideBarBookKey, toggleScrollMode, goLeft, goRight, goPrev, goNext, 
    goHalfPageUp, goHalfPageDown, goBack, switchSideBar, getView
  ]);

  // 🎯 注册键盘事件监听
  useEffect(() => {
    if (!sideBarBookKey) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, sideBarBookKey]);

  return {
    toggleScrollMode,
    switchSideBar,
    goLeft,
    goRight,
    goPrev,
    goNext,
    goBack,
    goHalfPageDown,
    goHalfPageUp,
  };
};

export default useBookShortcuts; 