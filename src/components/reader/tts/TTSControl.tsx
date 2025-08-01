import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import TTSIcon from './TTSIcon';
import TTSPanel from './TTSPanel';
import Popup from '@/components/ui/Popup';
import { TTSController, parseSSMLLang, TTSUtils, TTSMark, TTSVoicesGroup } from '@/services/tts';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { EdgeVoice } from '@/data/edgeVoices';

interface Position {
  top: number;
  left: number;
}

interface TTSControlProps {
  bookKey: string;
}

const POPUP_PADDING = 16;
const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 180; // 增加高度以容纳所有内容

const TTSControl: React.FC<TTSControlProps> = ({ bookKey }) => {
  const [ttsLang, setTtsLang] = useState<string>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [panelPosition, setPanelPosition] = useState<Position>();
  const [trianglePosition, setTrianglePosition] = useState<Position>();

  const [timeoutOption, setTimeoutOption] = useState(0);
  const [timeoutTimestamp, setTimeoutTimestamp] = useState(0);
  const [timeoutFunc, setTimeoutFunc] = useState<ReturnType<typeof setTimeout> | null>(null);

  const popupPadding = useResponsiveSize(POPUP_PADDING);
  const maxWidth = window.innerWidth - 2 * popupPadding;
  const popupWidth = Math.min(maxWidth, useResponsiveSize(POPUP_WIDTH));
  const popupHeight = useResponsiveSize(POPUP_HEIGHT);

  const iconRef = useRef<HTMLDivElement>(null);
  const unblockerAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsControllerRef = useRef<TTSController | null>(null);
  const [ttsController, setTtsController] = useState<TTSController | null>(null);
  const [ttsClientsInited, setTtsClientsInitialized] = useState(false);

  // 组件销毁时清理TTS控制器（遵循readest模式）
  useEffect(() => {
    return () => {
      if (ttsControllerRef.current) {
        ttsControllerRef.current.shutdown();
        ttsControllerRef.current = null;
      }
    };
  }, []);

  // this enables WebAudio to play even when the mute toggle switch is ON
  const unblockAudio = () => {
    if (unblockerAudioRef.current) return;
    const audioElement = new Audio();
    audioElement.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4Ljg3AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//OEZAAADwAABHiAAQABAAACiL+zAAABpXKeAACAAADSAAAAAgDSAAAAAIAAANIAAAACgBmTkAABUAAAGkHAAAQAABARAAEOECIA==';
    audioElement.preload = 'auto';
    audioElement.addEventListener('canplaythrough', () => {
      audioElement.play().catch(() => {
        // ignore errors
      });
    });
    unblockerAudioRef.current = audioElement;
  };

  const updatePanelPosition = () => {
    if (!iconRef.current) return;
    
    const rect = iconRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 计算面板位置（在图标上方，给三角形留出空间）
    let panelTop = rect.top - popupHeight - 20; // 增加间距
    let panelLeft = rect.left + rect.width / 2 - popupWidth / 2;
    
    // 确保面板不超出屏幕顶部
    if (panelTop < popupPadding) {
      panelTop = rect.bottom + 20; // 如果上方空间不够，显示在下方
    }
    
    // 确保面板不超出屏幕左右边界
    if (panelLeft < popupPadding) {
      panelLeft = popupPadding;
    } else if (panelLeft + popupWidth > windowWidth - popupPadding) {
      panelLeft = windowWidth - popupWidth - popupPadding;
    }
    
    // 确保面板不超出屏幕底部
    if (panelTop + popupHeight > windowHeight - popupPadding) {
      panelTop = windowHeight - popupHeight - popupPadding;
    }
    
    setPanelPosition({ top: panelTop, left: panelLeft });
    
    // 三角形指向图标中心
    const triangleLeft = rect.left + rect.width / 2 - panelLeft;
    const triangleTop = panelTop < rect.top ? popupHeight : -8; // 根据面板位置调整三角形位置
    setTrianglePosition({ top: triangleTop, left: triangleLeft });
  };

  const togglePopup = () => {
    updatePanelPosition();
    if (!showPanel && ttsControllerRef.current) {
      const speakingLang = ttsControllerRef.current.getSpeakingLang() || ttsLang;
      setTtsLang(speakingLang);
    }
    setShowPanel((prev) => !prev);
  };

  const handleStop = async (ttsBookKey: string) => {
    if (bookKey !== ttsBookKey) return;
    
    const ttsController = ttsControllerRef.current;
    if (ttsController) {
      await ttsController.shutdown();
      ttsControllerRef.current = null;
      setTtsController(null);
    }
    
    // 清理所有状态
    setIsPlaying(false);
    setIsPaused(false);
    setShowPanel(false);
    setShowIndicator(false);
    setTtsClientsInitialized(false);
    
    if (timeoutFunc) {
      clearTimeout(timeoutFunc);
      setTimeoutFunc(null);
    }
    
    if (timeoutOption > 0) {
      setTimeoutOption(0);
      setTimeoutTimestamp(0);
    }
  };

  // 移除预先初始化逻辑 - 遵循readest模式，只在需要时创建控制器

  // 监听TTS控制器事件 - 基于readest的逻辑
  useEffect(() => {
    if (!ttsController || !bookKey) return;

    const handleSpeakMark = (e: Event) => {
      const mark = (e as CustomEvent<TTSMark>).detail;
      // 这里可以添加媒体会话信息更新
      console.log('TTS speak mark:', mark);
    };

    const handleHighlightMark = (e: Event) => {
      const range = (e as CustomEvent<Range>).detail;
      console.log('TTS highlight mark:', range);
      // 这里可以添加高亮位置的保存逻辑
    };

    ttsController.addEventListener('tts-speak-mark', handleSpeakMark);
    ttsController.addEventListener('tts-highlight-mark', handleHighlightMark);

    return () => {
      ttsController.removeEventListener('tts-speak-mark', handleSpeakMark);
      ttsController.removeEventListener('tts-highlight-mark', handleHighlightMark);
    };
  }, [ttsController, bookKey]);

  // 监听TTS事件 - 基于readest的逻辑
  useEffect(() => {
    const handleTTSSpeak = async (event: CustomEvent) => {
      const { bookKey: ttsBookKey, range } = event.detail;
      if (bookKey !== ttsBookKey) return;

      // 获取view元素
      const viewElement = document.querySelector('[data-foliate-view]');
      if (!viewElement || !(viewElement as any).view) {
        console.warn('No foliate view found');
        return;
      }

      const view = (viewElement as any).view;
      const primaryLang = 'zh-CN'; // 默认中文

      let ttsFromRange = range;
      if (!ttsFromRange) {
        // 如果没有传入range，使用当前阅读位置
        const contents = view.renderer.getContents();
        if (contents && contents[0] && contents[0].doc) {
          const selection = contents[0].doc.getSelection();
          if (selection && selection.rangeCount > 0) {
            ttsFromRange = selection.getRangeAt(0);
          }
        }
      }

      // 清理之前的控制器（完全遵循readest模式）
      if (ttsControllerRef.current) {
        ttsControllerRef.current.stop();
        ttsControllerRef.current = null;
      }

      setShowIndicator(true);

      try {
        // 解锁音频（移动端）
        TTSUtils.unblockAudio();
        
        setTtsClientsInitialized(false);
        const ttsController = new TTSController(null, view);
        await ttsController.init();
        await ttsController.initViewTTS();
        
        const ssml = view.tts?.from(ttsFromRange);
        if (ssml) {
          const lang = parseSSMLLang(ssml, primaryLang) || 'en';
          setIsPlaying(true);
          setTtsLang(lang);

          ttsController.setLang(lang);
          ttsController.setRate(1.0);
          ttsController.speak(ssml);
          ttsControllerRef.current = ttsController;
          setTtsController(ttsController);
        }
        setTtsClientsInitialized(true);
      } catch (error) {
        console.error('TTS not supported in this device:', error);
        setTtsClientsInitialized(false);
      }
    };

    const handleTTSStop = async (event: CustomEvent) => {
      const { bookKey: ttsBookKey } = event.detail;
      if (ttsControllerRef.current && bookKey === ttsBookKey) {
        handleStop(bookKey);
      }
    };

    // 添加事件监听器
    document.addEventListener('tts-speak', handleTTSSpeak as any);
    document.addEventListener('tts-stop', handleTTSStop as any);

    return () => {
      document.removeEventListener('tts-speak', handleTTSSpeak as any);
      document.removeEventListener('tts-stop', handleTTSStop as any);
    };
  }, [bookKey]);

  const handleTogglePlay = async () => {
    const ttsController = ttsControllerRef.current;
    if (!ttsController) return;

    if (isPlaying) {
      setIsPlaying(false);
      setIsPaused(true);
      await ttsController.pause();
    } else if (isPaused) {
      setIsPlaying(true);
      setIsPaused(false);
      // start for forward/backward/setvoice-paused
      // set rate don't pause the tts
      if (ttsController.state === 'paused') {
        await ttsController.resume();
      } else {
        await ttsController.start();
      }
    }
  };

  const handleBackward = async () => {
    const ttsController = ttsControllerRef.current;
    if (ttsController) {
      await ttsController.backward();
    }
  };

  const handleForward = async () => {
    const ttsController = ttsControllerRef.current;
    if (ttsController) {
      await ttsController.forward();
    }
  };

  const handleSetRate = (rate: number) => {
    const ttsController = ttsControllerRef.current;
    if (ttsController) {
      ttsController.setRate(rate);
    }
  };

  const handleGetVoices = async (lang: string): Promise<TTSVoicesGroup[]> => {
    const ttsController = ttsControllerRef.current;
    if (!ttsController) {
      return [];
    }
    return await ttsController.getVoices(lang);
  };

  const handleSetVoice = (voice: string, lang: string) => {
    const ttsController = ttsControllerRef.current;
    if (ttsController) {
      ttsController.setVoice(voice, lang);
    }
  };

  const handleGetVoiceId = (): string => {
    const ttsController = ttsControllerRef.current;
    if (!ttsController) {
      return '';
    }
    return ttsController.getVoiceId();
  };

  const handleSelectTimeout = (ttsBookKey: string, value: number) => {
    if (bookKey !== ttsBookKey) return;
    
    if (timeoutFunc) {
      clearTimeout(timeoutFunc);
      setTimeoutFunc(null);
    }
    
    setTimeoutOption(value);
    
    if (value > 0) {
      const timestamp = Date.now() + value * 1000;
      setTimeoutTimestamp(timestamp);
      
      const timeout = setTimeout(() => {
        handleStop(bookKey);
      }, value * 1000);
      
      setTimeoutFunc(timeout);
    } else {
      setTimeoutTimestamp(0);
      setTimeoutFunc(null);
    }
  };

  const handleDismissPopup = () => {
    setShowPanel(false);
  };

  useEffect(() => {
    if (!iconRef.current || !showPanel) return;
    const parentElement = iconRef.current.parentElement;
    if (!parentElement) return;

    const resizeObserver = new ResizeObserver(() => {
      updatePanelPosition();
    });
    resizeObserver.observe(parentElement);
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPanel]);

  return (
    <>
      {showPanel && (
        <div
          className='fixed inset-0 z-40'
          onClick={handleDismissPopup}
          onContextMenu={handleDismissPopup}
        />
      )}
      {showIndicator && (
        <div
          ref={iconRef}
          className={clsx(
            'absolute h-12 w-12',
            'right-6', // 固定在右侧
            'bottom-[70px] sm:bottom-14',
          )}
        >
          <TTSIcon isPlaying={isPlaying} ttsInited={ttsClientsInited} onClick={togglePopup} />
        </div>
      )}
      {showPanel && panelPosition && trianglePosition && ttsClientsInited && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Popup
            width={popupWidth}
            height={popupHeight}
            position={panelPosition}
            trianglePosition={trianglePosition}
            className='bg-base-200 shadow-xl border border-base-300 pointer-events-auto'
          >
          <TTSPanel
            bookKey={bookKey}
            ttsLang={ttsLang}
            isPlaying={isPlaying}
            timeoutOption={timeoutOption}
            timeoutTimestamp={timeoutTimestamp}
            onTogglePlay={handleTogglePlay}
            onBackward={handleBackward}
            onForward={handleForward}
            onSetRate={handleSetRate}
            onGetVoices={handleGetVoices}
            onSetVoice={handleSetVoice}
            onGetVoiceId={handleGetVoiceId}
            onSelectTimeout={handleSelectTimeout}
          />
          </Popup>
        </div>
      )}
    </>
  );
};

export default TTSControl;