import React, { useState, useEffect, useMemo } from 'react';
import { MdOutlineAutoMode, MdOutlineScreenRotation } from 'react-icons/md';
import { MdOutlineTextRotationNone, MdTextRotateVertical } from 'react-icons/md';
import { IoPhoneLandscapeOutline, IoPhonePortraitOutline } from 'react-icons/io5';
import { TbTextDirectionRtl } from 'react-icons/tb';
import { useReaderStore } from '../../../store/readerStore';
import { useViewSettingsSync, useResetViewSettings } from '../../../utils/viewSettingsHelper';
import { useSettingsStore } from '../../../store/settingsStore';
import { DEFAULT_VIEW_SETTINGS } from '../../../utils/constants';
import { ViewSettings, WritingMode } from '../../../types/book';
import NumberInput from '../../ui/NumberInput';

interface LayoutPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const LayoutPanel: React.FC<LayoutPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getView, getViewSettings, setViewSettings, initializeViewSettings } = useReaderStore();
  const { saveViewSettings, isFontLayoutSettingsGlobal } = useViewSettingsSync();
  const { updateGlobalViewSettings } = useSettingsStore();
  const resetViewSettings = useResetViewSettings();

  // 确保viewSettings已初始化
  useEffect(() => {
    initializeViewSettings(bookKey);
  }, [bookKey, initializeViewSettings]);

  const viewSettings = getViewSettings(bookKey);
  const view = getView(bookKey);

  // 使用useMemo确保设置值的稳定性，避免频繁重渲染
  const currentSettings = useMemo(() => {
    return viewSettings || DEFAULT_VIEW_SETTINGS;
  }, [viewSettings]);

  // 文本布局相关状态 - 使用currentSettings确保有值
  const [paragraphMargin, setParagraphMargin] = useState(currentSettings.paragraphMargin);
  const [lineHeight, setLineHeight] = useState(currentSettings.lineHeight);
  const [wordSpacing, setWordSpacing] = useState(currentSettings.wordSpacing);
  const [letterSpacing, setLetterSpacing] = useState(currentSettings.letterSpacing);
  const [textIndent, setTextIndent] = useState(currentSettings.textIndent);
  const [fullJustification, setFullJustification] = useState(currentSettings.fullJustification);
  const [hyphenation, setHyphenation] = useState(currentSettings.hyphenation);
  
  // 布局控制相关状态
  const [overrideLayout, setOverrideLayout] = useState(currentSettings.overrideLayout);
  const [writingMode, setWritingMode] = useState<WritingMode>(currentSettings.writingMode);
  
  // 边框相关状态
  const [doubleBorder, setDoubleBorder] = useState(currentSettings.doubleBorder);
  const [borderColor, setBorderColor] = useState(currentSettings.borderColor);
  
  // 页边距设置
  const [marginTopPx, setMarginTopPx] = useState(currentSettings.marginTopPx);
  const [marginBottomPx, setMarginBottomPx] = useState(currentSettings.marginBottomPx);
  const [marginLeftPx, setMarginLeftPx] = useState(currentSettings.marginLeftPx);
  const [marginRightPx, setMarginRightPx] = useState(currentSettings.marginRightPx);
  
  // 紧凑模式页边距
  const [compactMarginTopPx, setCompactMarginTopPx] = useState(currentSettings.compactMarginTopPx);
  const [compactMarginBottomPx, setCompactMarginBottomPx] = useState(currentSettings.compactMarginBottomPx);
  const [compactMarginLeftPx, setCompactMarginLeftPx] = useState(currentSettings.compactMarginLeftPx);
  const [compactMarginRightPx, setCompactMarginRightPx] = useState(currentSettings.compactMarginRightPx);
  
  // 列设置
  const [gapPercent, setGapPercent] = useState(currentSettings.gapPercent);
  const [maxColumnCount, setMaxColumnCount] = useState(currentSettings.maxColumnCount);
  const [maxInlineSize, setMaxInlineSize] = useState(currentSettings.maxInlineSize);
  const [maxBlockSize, setMaxBlockSize] = useState(currentSettings.maxBlockSize);
  
  // 页眉页脚设置
  const [showHeader, setShowHeader] = useState(currentSettings.showHeader);
  const [showFooter, setShowFooter] = useState(currentSettings.showFooter);
  const [showBarsOnScroll, setShowBarsOnScroll] = useState(currentSettings.showBarsOnScroll);
  const [showRemainingTime, setShowRemainingTime] = useState(currentSettings.showRemainingTime);
  const [showRemainingPages, setShowRemainingPages] = useState(currentSettings.showRemainingPages);
  const [showPageNumber, setShowPageNumber] = useState(currentSettings.showPageNumber);
  
  // 屏幕方向设置
  const [screenOrientation, setScreenOrientation] = useState(currentSettings.screenOrientation);

  // 重置函数
  const handleReset = () => {
    const defaultSettings = DEFAULT_VIEW_SETTINGS;
    
    setParagraphMargin(defaultSettings.paragraphMargin);
    setLineHeight(defaultSettings.lineHeight);
    setWordSpacing(defaultSettings.wordSpacing);
    setLetterSpacing(defaultSettings.letterSpacing);
    setTextIndent(defaultSettings.textIndent);
    setFullJustification(defaultSettings.fullJustification);
    setHyphenation(defaultSettings.hyphenation);
    setOverrideLayout(defaultSettings.overrideLayout);
    setWritingMode(defaultSettings.writingMode);
    setDoubleBorder(defaultSettings.doubleBorder);
    setBorderColor(defaultSettings.borderColor);
    setMarginTopPx(defaultSettings.marginTopPx);
    setMarginBottomPx(defaultSettings.marginBottomPx);
    setMarginLeftPx(defaultSettings.marginLeftPx);
    setMarginRightPx(defaultSettings.marginRightPx);
    setCompactMarginTopPx(defaultSettings.compactMarginTopPx);
    setCompactMarginBottomPx(defaultSettings.compactMarginBottomPx);
    setCompactMarginLeftPx(defaultSettings.compactMarginLeftPx);
    setCompactMarginRightPx(defaultSettings.compactMarginRightPx);
    setGapPercent(defaultSettings.gapPercent);
    setMaxColumnCount(defaultSettings.maxColumnCount);
    setMaxInlineSize(defaultSettings.maxInlineSize);
    setMaxBlockSize(defaultSettings.maxBlockSize);
    setShowHeader(defaultSettings.showHeader);
    setShowFooter(defaultSettings.showFooter);
    setShowBarsOnScroll(defaultSettings.showBarsOnScroll);
    setShowRemainingTime(defaultSettings.showRemainingTime);
    setShowRemainingPages(defaultSettings.showRemainingPages);
    setShowPageNumber(defaultSettings.showPageNumber);
    setScreenOrientation(defaultSettings.screenOrientation);
  };

  // 注册重置函数
  useEffect(() => {
    onRegisterReset(handleReset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当currentSettings变化时，同步更新所有状态 - 这解决了初始化延迟问题
  useEffect(() => {
    setParagraphMargin(currentSettings.paragraphMargin);
    setLineHeight(currentSettings.lineHeight);
    setWordSpacing(currentSettings.wordSpacing);
    setLetterSpacing(currentSettings.letterSpacing);
    setTextIndent(currentSettings.textIndent);
    setFullJustification(currentSettings.fullJustification);
    setHyphenation(currentSettings.hyphenation);
    setOverrideLayout(currentSettings.overrideLayout);
    setWritingMode(currentSettings.writingMode);
    setDoubleBorder(currentSettings.doubleBorder);
    setBorderColor(currentSettings.borderColor);
    setMarginTopPx(currentSettings.marginTopPx);
    setMarginBottomPx(currentSettings.marginBottomPx);
    setMarginLeftPx(currentSettings.marginLeftPx);
    setMarginRightPx(currentSettings.marginRightPx);
    setCompactMarginTopPx(currentSettings.compactMarginTopPx);
    setCompactMarginBottomPx(currentSettings.compactMarginBottomPx);
    setCompactMarginLeftPx(currentSettings.compactMarginLeftPx);
    setCompactMarginRightPx(currentSettings.compactMarginRightPx);
    setGapPercent(currentSettings.gapPercent);
    setMaxColumnCount(currentSettings.maxColumnCount);
    setMaxInlineSize(currentSettings.maxInlineSize);
    setMaxBlockSize(currentSettings.maxBlockSize);
    setShowHeader(currentSettings.showHeader);
    setShowFooter(currentSettings.showFooter);
    setShowBarsOnScroll(currentSettings.showBarsOnScroll);
    setShowRemainingTime(currentSettings.showRemainingTime);
    setShowRemainingPages(currentSettings.showRemainingPages);
    setShowPageNumber(currentSettings.showPageNumber);
    setScreenOrientation(currentSettings.screenOrientation);
  }, [currentSettings]);

  // ===== readest风格的useEffect设置监听 =====
  
  // 文本设置
  useEffect(() => {
    if (!viewSettings) return; // 等待viewSettings初始化完成
    saveViewSettings(bookKey, 'paragraphMargin', paragraphMargin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paragraphMargin, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'lineHeight', lineHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineHeight, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'wordSpacing', wordSpacing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordSpacing, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'letterSpacing', letterSpacing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterSpacing, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'textIndent', textIndent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textIndent, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'fullJustification', fullJustification);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullJustification, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'hyphenation', hyphenation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hyphenation, viewSettings]);

  // 布局控制设置
  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'overrideLayout', overrideLayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideLayout, viewSettings]);

  useEffect(() => {
    if (!viewSettings || writingMode === viewSettings.writingMode) return;
    saveViewSettings(bookKey, 'writingMode', writingMode);
    // TODO: 处理书籍方向和重新加载逻辑
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writingMode, viewSettings]);

  // 边框设置
  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'doubleBorder', doubleBorder, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doubleBorder, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'borderColor', borderColor, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borderColor, viewSettings]);

  // 页边距设置（仿照readest的防重复逻辑）
  useEffect(() => {
    if (!viewSettings || marginTopPx === viewSettings.marginTopPx) return;
    saveViewSettings(bookKey, 'marginTopPx', marginTopPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginTopPx, viewSettings]);

  useEffect(() => {
    if (!viewSettings || marginBottomPx === viewSettings.marginBottomPx) return;
    saveViewSettings(bookKey, 'marginBottomPx', marginBottomPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginBottomPx, viewSettings]);

  useEffect(() => {
    if (!viewSettings || marginLeftPx === viewSettings.marginLeftPx) return;
    saveViewSettings(bookKey, 'marginLeftPx', marginLeftPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginLeftPx, viewSettings]);

  useEffect(() => {
    if (!viewSettings || marginRightPx === viewSettings.marginRightPx) return;
    saveViewSettings(bookKey, 'marginRightPx', marginRightPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginRightPx, viewSettings]);

  useEffect(() => {
    if (!viewSettings || compactMarginTopPx === viewSettings.compactMarginTopPx) return;
    saveViewSettings(bookKey, 'compactMarginTopPx', compactMarginTopPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compactMarginTopPx, viewSettings]);

  useEffect(() => {
    if (!viewSettings || compactMarginBottomPx === viewSettings.compactMarginBottomPx) return;
    saveViewSettings(bookKey, 'compactMarginBottomPx', compactMarginBottomPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compactMarginBottomPx, viewSettings]);

  useEffect(() => {
    if (!viewSettings || compactMarginLeftPx === viewSettings.compactMarginLeftPx) return;
    saveViewSettings(bookKey, 'compactMarginLeftPx', compactMarginLeftPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compactMarginLeftPx, viewSettings]);

  useEffect(() => {
    if (!viewSettings || compactMarginRightPx === viewSettings.compactMarginRightPx) return;
    saveViewSettings(bookKey, 'compactMarginRightPx', compactMarginRightPx, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compactMarginRightPx, viewSettings]);

  // 列设置
  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'gapPercent', gapPercent, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gapPercent, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'maxColumnCount', maxColumnCount, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxColumnCount, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'maxInlineSize', maxInlineSize, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxInlineSize, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'maxBlockSize', maxBlockSize, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxBlockSize, viewSettings]);

  // 页眉页脚设置
  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'showHeader', showHeader, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHeader, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'showFooter', showFooter, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFooter, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'showBarsOnScroll', showBarsOnScroll, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBarsOnScroll, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'showRemainingTime', showRemainingTime, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRemainingTime, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'showRemainingPages', showRemainingPages, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRemainingPages, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'showPageNumber', showPageNumber, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPageNumber, viewSettings]);

  useEffect(() => {
    if (!viewSettings) return;
    saveViewSettings(bookKey, 'screenOrientation', screenOrientation, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenOrientation, viewSettings]);

  // 检查是否为中日韩环境或RTL语言书籍
  const mightBeRTLBook = true; // 暂时设为true，实际应该根据书籍语言判断
  const isVertical = currentSettings.vertical || writingMode.includes('vertical');

  // 如果viewSettings还没有初始化，显示加载状态
  if (!viewSettings) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center py-8">
          <span className="loading loading-spinner loading-md"></span>
          <span className="ml-2">初始化设置中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 w-full space-y-6">
      {/* 覆盖版面布局 - 关键开关 */}
      <div className={`p-4 rounded-lg border-2 transition-all ${
        overrideLayout 
          ? 'border-primary bg-primary/10' 
          : 'border-warning bg-warning/10'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">覆盖版面布局</h2>
            {!overrideLayout && (
              <span className="badge badge-warning badge-sm">重要</span>
            )}
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={overrideLayout}
            onChange={() => setOverrideLayout(!overrideLayout)}
          />
        </div>
        <p className="text-sm opacity-70">
          {overrideLayout 
            ? "✅ 已启用：所有布局设置将强制覆盖电子书原始样式"
            : "⚠️ 未启用：布局设置可能被电子书原始样式覆盖，如首行缩进不生效时请启用此选项"
          }
        </p>
      </div>

      {/* 排版模式 */}
      {mightBeRTLBook && (
        <div className="flex items-center justify-between">
          <h2 className="font-medium">排版模式</h2>
          <div className="flex gap-4">
            <div className="lg:tooltip lg:tooltip-bottom" data-tip="自动">
              <button
                className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'auto' ? 'btn-active bg-base-300' : ''}`}
                onClick={() => setWritingMode('auto')}
              >
                <MdOutlineAutoMode />
              </button>
            </div>

            <div className="lg:tooltip lg:tooltip-bottom" data-tip="水平">
              <button
                className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'horizontal-tb' ? 'btn-active bg-base-300' : ''}`}
                onClick={() => setWritingMode('horizontal-tb')}
              >
                <MdOutlineTextRotationNone />
              </button>
            </div>

            <div className="lg:tooltip lg:tooltip-bottom" data-tip="垂直">
              <button
                className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'vertical-rl' ? 'btn-active bg-base-300' : ''}`}
                onClick={() => setWritingMode('vertical-rl')}
              >
                <MdTextRotateVertical />
              </button>
            </div>

            <div className="lg:tooltip lg:tooltip-bottom" data-tip="从右到左">
              <button
                className={`btn btn-ghost btn-circle btn-sm ${writingMode === 'horizontal-rl' ? 'btn-active bg-base-300' : ''}`}
                onClick={() => setWritingMode('horizontal-rl')}
              >
                <TbTextDirectionRtl />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 边框设置（仅在垂直模式下显示） */}
      {isVertical && (
        <div className="w-full">
          <h2 className="mb-2 font-medium">边框设置</h2>
          <div className="card bg-base-100 border-base-200 border shadow">
            <div className="divide-base-200 divide-y">
              <div className="config-item">
                <span>双边框</span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={doubleBorder}
                  onChange={() => setDoubleBorder(!doubleBorder)}
                />
              </div>

              <div className="config-item">
                <span>边框颜色</span>
                <div className="flex gap-4">
                  <button
                    className={`btn btn-circle btn-sm bg-red-300 hover:bg-red-500 ${borderColor === 'red' ? 'btn-active !bg-red-500' : ''}`}
                    onClick={() => setBorderColor('red')}
                  ></button>

                  <button
                    className={`btn btn-circle btn-sm bg-black/50 hover:bg-black ${borderColor === 'black' ? 'btn-active !bg-black' : ''}`}
                    onClick={() => setBorderColor('black')}
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 段落设置 */}
      <div className="w-full">
        <h2 className="mb-2 font-medium">段落</h2>
        <div className="card bg-base-100 border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
        <NumberInput
          label="段落间距 (em)"
          value={paragraphMargin}
              onChange={setParagraphMargin}
          min={0}
              max={4}
              step={0.2}
        />
        <NumberInput
          label="行高"
          value={lineHeight}
              onChange={setLineHeight}
              min={1.0}
              max={3.0}
          step={0.1}
        />
        <NumberInput
          label="字间距 (px)"
          value={wordSpacing}
              onChange={setWordSpacing}
              min={-4}
              max={8}
          step={0.5}
        />
        <NumberInput
          label="字母间距 (px)"
          value={letterSpacing}
              onChange={setLetterSpacing}
          min={-2}
              max={4}
              step={0.5}
        />
        <NumberInput
          label="首行缩进 (em)"
          value={textIndent}
              onChange={setTextIndent}
              min={-2}
              max={4}
              step={1}
            />
            
            {/* 首行缩进提示 */}
            {!overrideLayout && textIndent > 0 && (
              <div className="config-item bg-warning/20 border border-warning/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-warning">⚠️</span>
                  <span className="text-sm">首行缩进可能不生效？请启用上方的"覆盖版面布局"</span>
                </div>
              </div>
            )}
            <div className="config-item">
              <span>两端对齐</span>
          <input
            type="checkbox"
                className="toggle"
            checked={fullJustification}
                onChange={() => setFullJustification(!fullJustification)}
              />
        </div>
            <div className="config-item">
              <span>自动断词</span>
          <input
            type="checkbox"
                className="toggle"
            checked={hyphenation}
                onChange={() => setHyphenation(!hyphenation)}
              />
            </div>
        </div>
        </div>
      </div>

      {/* 页面设置 */}
      <div className="w-full">
        <h2 className="mb-2 font-medium">页面</h2>
        <div className="card bg-base-100 border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
          <NumberInput
              label="上边距 (px)"
              value={showHeader && !isVertical ? marginTopPx : compactMarginTopPx}
            onChange={(value) => {
                if (showHeader && !isVertical) {
                setMarginTopPx(value);
              } else {
                setCompactMarginTopPx(value);
              }
            }}
            min={0}
            max={88}
            step={4}
          />
          <NumberInput
              label="下边距 (px)"
              value={showFooter && !isVertical ? marginBottomPx : compactMarginBottomPx}
            onChange={(value) => {
                if (showFooter && !isVertical) {
                setMarginBottomPx(value);
              } else {
                setCompactMarginBottomPx(value);
              }
            }}
            min={0}
            max={88}
            step={4}
          />
          <NumberInput
              label="左边距 (px)"
              value={showFooter && isVertical ? marginLeftPx : compactMarginLeftPx}
            onChange={(value) => {
                if (showFooter && isVertical) {
                setMarginLeftPx(value);
              } else {
                setCompactMarginLeftPx(value);
              }
            }}
            min={0}
            max={88}
            step={4}
          />
          <NumberInput
              label="右边距 (px)"
            value={showHeader && isVertical ? marginRightPx : compactMarginRightPx}
            onChange={(value) => {
              if (showHeader && isVertical) {
                setMarginRightPx(value);
              } else {
                setCompactMarginRightPx(value);
              }
            }}
            min={0}
            max={88}
            step={4}
          />
        <NumberInput
          label="列间距 (%)"
          value={gapPercent}
              onChange={setGapPercent}
          min={0}
          max={30}
          step={1}
        />
        <NumberInput
          label="最大列数"
          value={maxColumnCount}
              onChange={setMaxColumnCount}
          min={1}
          max={4}
          step={1}
        />
        <NumberInput
          label={isVertical ? '最大列高度' : '最大列宽度'}
          value={maxInlineSize}
              onChange={setMaxInlineSize}
              disabled={maxColumnCount === 1 || currentSettings.scrolled}
          min={400}
          max={9999}
          step={100}
        />
        <NumberInput
          label={isVertical ? '最大列宽度' : '最大列高度'}
          value={maxBlockSize}
              onChange={setMaxBlockSize}
              disabled={maxColumnCount === 1 || currentSettings.scrolled}
          min={400}
          max={9999}
          step={100}
        />
      </div>
        </div>
      </div>

      {/* 页眉页脚设置 */}
      <div className="w-full">
        <h2 className="mb-2 font-medium">页眉页脚</h2>
        <div className="card bg-base-100 border-base-200 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item">
              <span>显示页眉</span>
            <input
              type="checkbox"
                className="toggle"
              checked={showHeader}
                onChange={() => setShowHeader(!showHeader)}
              />
          </div>
            <div className="config-item">
              <span>显示页脚</span>
            <input
              type="checkbox"
                className="toggle"
              checked={showFooter}
                onChange={() => setShowFooter(!showFooter)}
              />
          </div>
            <div className="config-item">
              <span>显示剩余时间</span>
            <input
              type="checkbox"
                className="toggle"
                checked={showRemainingTime}
                disabled={!showFooter}
                onChange={() => {
                  if (!showRemainingTime) {
                    setShowRemainingTime(true);
                    setShowRemainingPages(false);
                  } else {
                    setShowRemainingTime(false);
                  }
                }}
              />
          </div>
            <div className="config-item">
              <span>显示剩余页数</span>
            <input
              type="checkbox"
                className="toggle"
                checked={showRemainingPages}
                disabled={!showFooter}
                onChange={() => {
                  if (!showRemainingPages) {
                    setShowRemainingPages(true);
                    setShowRemainingTime(false);
                  } else {
                    setShowRemainingPages(false);
                  }
                }}
              />
          </div>
            <div className="config-item">
              <span>显示页码</span>
            <input
              type="checkbox"
                className="toggle"
                checked={showPageNumber}
                disabled={!showFooter}
                onChange={() => setShowPageNumber(!showPageNumber)}
              />
          </div>
            <div className="config-item">
              <span>滚动模式下也显示</span>
            <input
              type="checkbox"
                className="toggle"
                checked={showBarsOnScroll}
                onChange={() => setShowBarsOnScroll(!showBarsOnScroll)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 屏幕方向设置 */}
      <div className="w-full">
        <h2 className="mb-2 font-medium">屏幕</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item">
              <span>方向</span>
              <div className="flex gap-4">
                <div className="lg:tooltip lg:tooltip-bottom" data-tip="自动">
                  <button
                    className={`btn btn-ghost btn-circle btn-sm ${screenOrientation === 'auto' ? 'btn-active bg-base-300' : ''}`}
                    onClick={() => setScreenOrientation('auto')}
                  >
                    <MdOutlineScreenRotation />
                  </button>
                </div>

                <div className="lg:tooltip lg:tooltip-bottom" data-tip="纵向">
                  <button
                    className={`btn btn-ghost btn-circle btn-sm ${screenOrientation === 'portrait' ? 'btn-active bg-base-300' : ''}`}
                    onClick={() => setScreenOrientation('portrait')}
                  >
                    <IoPhonePortraitOutline />
                  </button>
                </div>

                <div className="lg:tooltip lg:tooltip-bottom" data-tip="横向">
                  <button
                    className={`btn btn-ghost btn-circle btn-sm ${screenOrientation === 'landscape' ? 'btn-active bg-base-300' : ''}`}
                    onClick={() => setScreenOrientation('landscape')}
                  >
                    <IoPhoneLandscapeOutline />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutPanel; 