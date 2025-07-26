import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { useReaderStore } from '@/store/readerStore';
import NumberInput from './NumberInput';

interface LayoutPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const LayoutPanel: React.FC<LayoutPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getView, getViewSettings, setViewSettings } = useReaderStore();
  const viewSettings = getViewSettings(bookKey);
  const view = getView(bookKey);

  const [marginTopPx, setMarginTopPx] = useState(viewSettings?.marginTopPx || 44);
  const [marginBottomPx, setMarginBottomPx] = useState(viewSettings?.marginBottomPx || 44);
  const [marginLeftPx, setMarginLeftPx] = useState(viewSettings?.marginLeftPx || 16);
  const [marginRightPx, setMarginRightPx] = useState(viewSettings?.marginRightPx || 16);
  const [gapPercent, setGapPercent] = useState(viewSettings?.gapPercent || 5);
  const [maxColumnCount, setMaxColumnCount] = useState(viewSettings?.maxColumnCount || 2);
  const [maxInlineSize, setMaxInlineSize] = useState(viewSettings?.maxInlineSize || 720);
  const [maxBlockSize, setMaxBlockSize] = useState(viewSettings?.maxBlockSize || 1440);
  const [showHeader, setShowHeader] = useState<boolean>(viewSettings?.showHeader ?? true);
  const [showFooter, setShowFooter] = useState<boolean>(viewSettings?.showFooter ?? true);
  const [doubleBorder, setDoubleBorder] = useState<boolean>(viewSettings?.doubleBorder ?? false);

  const resetToDefaults = () => {
    setMarginTopPx(44);
    setMarginBottomPx(44);
    setMarginLeftPx(16);
    setMarginRightPx(16);
    setGapPercent(5);
    setMaxColumnCount(2);
    setMaxInlineSize(720);
    setMaxBlockSize(1440);
    setShowHeader(true);
    setShowFooter(true);
    setDoubleBorder(false);
  };

  useEffect(() => {
    onRegisterReset(resetToDefaults);
  }, [onRegisterReset]);

  useEffect(() => {
    if (viewSettings && viewSettings.marginTopPx !== marginTopPx) {
      const updatedSettings = { ...viewSettings, marginTopPx };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用上边距到视图
      if (view?.renderer) {
        view.renderer.setAttribute('margin-top', `${marginTopPx}px`);
      }
    }
  }, [marginTopPx, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.marginBottomPx !== marginBottomPx) {
      const updatedSettings = { ...viewSettings, marginBottomPx };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用下边距到视图
      if (view?.renderer) {
        view.renderer.setAttribute('margin-bottom', `${marginBottomPx}px`);
      }
    }
  }, [marginBottomPx, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.marginLeftPx !== marginLeftPx) {
      const updatedSettings = { ...viewSettings, marginLeftPx };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用左边距到视图
      if (view?.renderer) {
        view.renderer.setAttribute('margin-left', `${marginLeftPx}px`);
      }
    }
  }, [marginLeftPx, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.marginRightPx !== marginRightPx) {
      const updatedSettings = { ...viewSettings, marginRightPx };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用右边距到视图
      if (view?.renderer) {
        view.renderer.setAttribute('margin-right', `${marginRightPx}px`);
      }
    }
  }, [marginRightPx, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.gapPercent !== gapPercent) {
      const updatedSettings = { ...viewSettings, gapPercent };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用间距到视图
      if (view?.renderer) {
        view.renderer.setAttribute('gap', `${gapPercent}%`);
      }
    }
  }, [gapPercent, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.maxColumnCount !== maxColumnCount) {
      const updatedSettings = { ...viewSettings, maxColumnCount };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用列数到视图
      if (view?.renderer) {
        view.renderer.setAttribute('max-column-count', maxColumnCount.toString());
      }
    }
  }, [maxColumnCount, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.maxInlineSize !== maxInlineSize) {
      const updatedSettings = { ...viewSettings, maxInlineSize };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用最大内联尺寸到视图
      if (view?.renderer) {
        view.renderer.setAttribute('max-inline-size', `${maxInlineSize}px`);
      }
    }
  }, [maxInlineSize, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.maxBlockSize !== maxBlockSize) {
      const updatedSettings = { ...viewSettings, maxBlockSize };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用最大块尺寸到视图
      if (view?.renderer) {
        view.renderer.setAttribute('max-block-size', `${maxBlockSize}px`);
      }
    }
  }, [maxBlockSize, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.showHeader !== showHeader) {
      const updatedSettings = { ...viewSettings, showHeader };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [showHeader, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.showFooter !== showFooter) {
      const updatedSettings = { ...viewSettings, showFooter };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [showFooter, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.doubleBorder !== doubleBorder) {
      const updatedSettings = { ...viewSettings, doubleBorder };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [doubleBorder, viewSettings, bookKey, setViewSettings]);

  return (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">边距</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <NumberInput
              label="上边距"
              value={marginTopPx}
              onChange={setMarginTopPx}
              min={0}
              max={100}
            />
            <NumberInput
              label="下边距"
              value={marginBottomPx}
              onChange={setMarginBottomPx}
              min={0}
              max={100}
            />
            <NumberInput
              label="左边距"
              value={marginLeftPx}
              onChange={setMarginLeftPx}
              min={0}
              max={100}
            />
            <NumberInput
              label="右边距"
              value={marginRightPx}
              onChange={setMarginRightPx}
              min={0}
              max={100}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">布局</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <NumberInput
              label="间距百分比"
              value={gapPercent}
              onChange={setGapPercent}
              min={0}
              max={20}
            />
            <NumberInput
              label="最大列数"
              value={maxColumnCount}
              onChange={setMaxColumnCount}
              min={1}
              max={4}
            />
            <NumberInput
              label="最大内联尺寸"
              value={maxInlineSize}
              onChange={setMaxInlineSize}
              min={400}
              max={1200}
              step={20}
            />
            <NumberInput
              label="最大块尺寸"
              value={maxBlockSize}
              onChange={setMaxBlockSize}
              min={800}
              max={2000}
              step={40}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">显示选项</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>显示页眉</span>
              <input
                type="checkbox"
                className="toggle"
                checked={showHeader}
                onChange={() => setShowHeader(!showHeader)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>显示页脚</span>
              <input
                type="checkbox"
                className="toggle"
                checked={showFooter}
                onChange={() => setShowFooter(!showFooter)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>双边框</span>
              <input
                type="checkbox"
                className="toggle"
                checked={doubleBorder}
                onChange={() => setDoubleBorder(!doubleBorder)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutPanel; 