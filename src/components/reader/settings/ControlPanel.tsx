import React, { useEffect, useState } from 'react';

import { useReaderStore } from '@/store/readerStore';
import NumberInput from './NumberInput';

interface ControlPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getView, getViewSettings, setViewSettings } = useReaderStore();
  const viewSettings = getViewSettings(bookKey);
  const view = getView(bookKey);

  const [isScrolledMode, setScrolledMode] = useState(viewSettings?.scrolled ?? false);
  const [isContinuousScroll, setIsContinuousScroll] = useState(viewSettings?.continuousScroll ?? false);
  const [scrollingOverlap, setScrollingOverlap] = useState(viewSettings?.scrollingOverlap ?? 0);
  const [volumeKeysToFlip, setVolumeKeysToFlip] = useState(viewSettings?.volumeKeysToFlip ?? false);
  const [isDisableClick, setIsDisableClick] = useState(viewSettings?.disableClick ?? false);
  const [swapClickArea, setSwapClickArea] = useState(viewSettings?.swapClickArea ?? false);
  const [animated, setAnimated] = useState(viewSettings?.animated ?? true);
  const [allowScript, setAllowScript] = useState(viewSettings?.allowScript ?? false);

  const resetToDefaults = () => {
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
    onRegisterReset(resetToDefaults);
  }, [onRegisterReset]);

  useEffect(() => {
    if (viewSettings && viewSettings.scrolled !== isScrolledMode) {
      const updatedSettings = { ...viewSettings, scrolled: isScrolledMode };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用滚动模式到视图
      if (view?.renderer) {
        view.renderer.setAttribute('flow', isScrolledMode ? 'scrolled' : 'paginated');
      }
    }
  }, [isScrolledMode, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.continuousScroll !== isContinuousScroll) {
      const updatedSettings = { ...viewSettings, continuousScroll: isContinuousScroll };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [isContinuousScroll, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.scrollingOverlap !== scrollingOverlap) {
      const updatedSettings = { ...viewSettings, scrollingOverlap };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [scrollingOverlap, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.volumeKeysToFlip !== volumeKeysToFlip) {
      const updatedSettings = { ...viewSettings, volumeKeysToFlip };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [volumeKeysToFlip, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.disableClick !== isDisableClick) {
      const updatedSettings = { ...viewSettings, disableClick: isDisableClick };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [isDisableClick, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.swapClickArea !== swapClickArea) {
      const updatedSettings = { ...viewSettings, swapClickArea };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [swapClickArea, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.animated !== animated) {
      const updatedSettings = { ...viewSettings, animated };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [animated, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.allowScript !== allowScript) {
      const updatedSettings = { ...viewSettings, allowScript };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [allowScript, viewSettings, bookKey, setViewSettings]);

  return (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">阅读模式</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>滚动模式</span>
              <input
                type="checkbox"
                className="toggle"
                checked={isScrolledMode}
                onChange={() => setScrolledMode(!isScrolledMode)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>连续滚动</span>
              <input
                type="checkbox"
                className="toggle"
                checked={isContinuousScroll}
                onChange={() => setIsContinuousScroll(!isContinuousScroll)}
                disabled={!isScrolledMode}
              />
            </div>
            <NumberInput
              label="滚动重叠"
              value={scrollingOverlap}
              onChange={setScrollingOverlap}
              min={0}
              max={100}
              disabled={!isScrolledMode}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">交互控制</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>音量键翻页</span>
              <input
                type="checkbox"
                className="toggle"
                checked={volumeKeysToFlip}
                onChange={() => setVolumeKeysToFlip(!volumeKeysToFlip)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>禁用点击</span>
              <input
                type="checkbox"
                className="toggle"
                checked={isDisableClick}
                onChange={() => setIsDisableClick(!isDisableClick)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>交换点击区域</span>
              <input
                type="checkbox"
                className="toggle"
                checked={swapClickArea}
                onChange={() => setSwapClickArea(!swapClickArea)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">动画</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>启用动画</span>
              <input
                type="checkbox"
                className="toggle"
                checked={animated}
                onChange={() => setAnimated(!animated)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">脚本</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>允许脚本</span>
              <input
                type="checkbox"
                className="toggle"
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