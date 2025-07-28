import React, { useEffect, useState } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { useViewSettingsSync } from '@/utils/viewSettingsHelper';
import { getCompleteStyles } from '@/utils/style';
import { getMaxInlineSize } from '@/utils/config';
import { useTranslation } from '@/hooks/useTranslation';
import NumberInput from './NumberInput';

interface ControlPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ bookKey, onRegisterReset }) => {
  const _ = useTranslation()._;
  const { getView, getViewSettings } = useReaderStore();
  const { saveViewSettings } = useViewSettingsSync();
  const viewSettings = getViewSettings(bookKey);

  const [isScrolledMode, setScrolledMode] = useState(viewSettings?.scrolled ?? false);
  const [isContinuousScroll, setIsContinuousScroll] = useState(viewSettings?.continuousScroll ?? false);
  const [scrollingOverlap, setScrollingOverlap] = useState(viewSettings?.scrollingOverlap ?? 0);
  const [volumeKeysToFlip, setVolumeKeysToFlip] = useState(viewSettings?.volumeKeysToFlip ?? false);
  const [isDisableClick, setIsDisableClick] = useState(viewSettings?.disableClick ?? false);
  const [swapClickArea, setSwapClickArea] = useState(viewSettings?.swapClickArea ?? false);
  const [animated, setAnimated] = useState(viewSettings?.animated ?? true);
  const [allowScript, setAllowScript] = useState(viewSettings?.allowScript ?? false);

  const handleReset = () => {
    setScrolledMode(false);
    setIsContinuousScroll(false);
    setScrollingOverlap(0);
    setVolumeKeysToFlip(false);
    setIsDisableClick(false);
    setSwapClickArea(false);
    setAnimated(true);
    setAllowScript(false);
  };

  useEffect(() => {
    onRegisterReset(handleReset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🎯 readest风格：滚动模式的特殊处理逻辑
  useEffect(() => {
    if (isScrolledMode === viewSettings?.scrolled || !viewSettings) return;
    
    console.log('🔄 滚动模式切换:', {
      bookKey,
      isScrolledMode,
      viewExists: !!getView(bookKey),
      rendererExists: !!getView(bookKey)?.renderer
    });
    
    saveViewSettings(bookKey, 'scrolled', isScrolledMode);
    const view = getView(bookKey);
    if (view?.renderer) {
      view.renderer.setAttribute('flow', isScrolledMode ? 'scrolled' : 'paginated');
      view.renderer.setAttribute(
        'max-inline-size',
        `${getMaxInlineSize(viewSettings)}px`,
      );
      view.renderer.setStyles?.(getCompleteStyles(viewSettings));
      console.log('✅ 滚动模式已应用:', isScrolledMode ? '滚动模式' : '分页模式');
    } else {
      console.error('❌ 未找到view或renderer:', { bookKey, view: !!view });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolledMode]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'continuousScroll', isContinuousScroll, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContinuousScroll]);

  useEffect(() => {
    if (scrollingOverlap === viewSettings?.scrollingOverlap || !viewSettings) return;
    saveViewSettings(bookKey, 'scrollingOverlap', scrollingOverlap, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollingOverlap]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'volumeKeysToFlip', volumeKeysToFlip, false, false);
    // TODO: 可以添加移动端音量键拦截
    // if (appService?.isMobileApp) {
    //   if (volumeKeysToFlip) {
    //     acquireVolumeKeyInterception();
    //   } else {
    //     releaseVolumeKeyInterception();
    //   }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeKeysToFlip]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'disableClick', isDisableClick, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisableClick]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'swapClickArea', swapClickArea, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapClickArea]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'animated', animated, false, false);
    if (animated) {
      getView(bookKey)?.renderer.setAttribute('animated', '');
    } else {
      getView(bookKey)?.renderer.removeAttribute('animated');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  useEffect(() => {
    if (viewSettings?.allowScript === allowScript || !viewSettings) return;
    saveViewSettings(bookKey, 'allowScript', allowScript, true, false);
    // TODO: 可以添加重新加载逻辑
    // saveAndReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowScript]);

  return (
    <div className='my-4 w-full space-y-6'>
      {/* 🎯 滚动设置区域 - readest风格 */}
      <div className='w-full'>
        <h2 className='mb-2 font-medium'>{_('Scroll')}</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <div className='config-item'>
              <span className=''>{_('Scrolled Mode')}</span>
              <input
                type='checkbox'
                className='toggle'
                checked={isScrolledMode}
                onChange={() => setScrolledMode(!isScrolledMode)}
              />
            </div>
            <div className='config-item'>
              <span className=''>{_('Continuous Scroll')}</span>
              <input
                type='checkbox'
                className='toggle'
                checked={isContinuousScroll}
                onChange={() => setIsContinuousScroll(!isContinuousScroll)}
              />
            </div>
            <NumberInput
              label={_('Overlap Pixels')}
              value={scrollingOverlap}
              onChange={setScrollingOverlap}
              disabled={!viewSettings?.scrolled}
              min={0}
              max={200}
              step={10}
            />
          </div>
        </div>
      </div>

      {/* 🎯 点击设置区域 - readest风格 */}
      <div className='w-full'>
        <h2 className='mb-2 font-medium'>{_('Click')}</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <div className='config-item'>
              <span className=''>{_('Clicks for Page Flip')}</span>
              <input
                type='checkbox'
                className='toggle'
                checked={!isDisableClick}
                onChange={() => setIsDisableClick(!isDisableClick)}
              />
            </div>
            <div className='config-item'>
              <span className=''>{_('Swap Clicks Area')}</span>
              <input
                type='checkbox'
                className='toggle'
                checked={swapClickArea}
                disabled={isDisableClick}
                onChange={() => setSwapClickArea(!swapClickArea)}
              />
            </div>
            <div className='config-item'>
              <span className=''>{_('Volume Keys for Page Flip')}</span>
              <input
                type='checkbox'
                className='toggle'
                checked={volumeKeysToFlip}
                onChange={() => setVolumeKeysToFlip(!volumeKeysToFlip)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 动画设置区域 - readest风格 */}
      <div className='w-full'>
        <h2 className='mb-2 font-medium'>{_('Animation')}</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <div className='config-item'>
              <span className=''>{_('Enable Animation')}</span>
              <input
                type='checkbox'
                className='toggle'
                checked={animated}
                onChange={() => setAnimated(!animated)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 脚本设置区域 - readest风格 */}
      <div className='w-full'>
        <h2 className='mb-2 font-medium'>{_('Script')}</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <div className='config-item'>
              <span className=''>{_('Allow Script')}</span>
              <input
                type='checkbox'
                className='toggle'
                checked={allowScript}
                onChange={() => setAllowScript(!allowScript)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 