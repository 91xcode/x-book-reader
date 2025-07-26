import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { useViewSettingsSync } from '@/utils/viewSettingsHelper';
import { useSettingsStore } from '@/store/settingsStore';
import NumberInput from './NumberInput';
import FontDropdown from './FontDropdown';
import { applyFontStyles } from '@/utils/fontStyles';

interface FontPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

// 字体常量定义
const SERIF_FONTS = ['Bitter', 'Georgia', 'Times New Roman', 'serif'];
const SANS_SERIF_FONTS = ['Roboto', 'Arial', 'Helvetica', 'sans-serif'];
const MONOSPACE_FONTS = ['Consolas', 'Monaco', 'Courier New', 'monospace'];
const CJK_SERIF_FONTS = ['LXGW WenKai', 'Noto Serif CJK SC', 'serif'];
const CJK_SANS_SERIF_FONTS = ['LXGW WenKai', 'Noto Sans CJK SC', 'sans-serif'];
const FALLBACK_FONTS = ['system-ui', '-apple-system', 'BlinkMacSystemFont'];

// 中文字体显示名称映射
const CJK_FONTS = ['LXGW WenKai', 'Noto Serif CJK SC', 'Noto Sans CJK SC'];
const CJK_FONTS_DISPLAY = ['LXGW 文楷', 'Noto 宋体', 'Noto 黑体'];

// 字体名称映射（显示名称 -> CSS名称）
const FONT_NAME_MAP: Record<string, string> = {
  'LXGW 文楷': 'LXGW WenKai',
  'Noto 宋体': 'Noto Serif CJK SC',
  'Noto 黑体': 'Noto Sans CJK SC',
};

// 反向映射（CSS名称 -> 显示名称）
const REVERSE_FONT_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(FONT_NAME_MAP).map(([display, css]) => [css, display])
);

interface FontFaceProps {
  className?: string;
  family: string;
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const handleFontFaceFont = (option: string, family: string) => {
  // 如果是中文字体名称，使用映射后的英文名称
  const fontName = FONT_NAME_MAP[option] || option;
  return `'${fontName}', ${family}`;
};

const FontFace = ({
  className,
  family,
  label,
  options,
  selected,
  onSelect,
}: FontFaceProps) => {
  return (
    <div className={className}>
      <span className='min-w-10'>{label}</span>
              <FontDropdown
          family={family}
        options={options.map((option) => ({ option, label: option }))}
        selected={selected}
        onSelect={onSelect}
        onGetFontFamily={handleFontFaceFont}
      />
    </div>
  );
};

const FontPanel: React.FC<FontPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getViewSettings } = useReaderStore();
  const { saveViewSetting } = useViewSettingsSync();
  const isInitialized = useRef(false);
  
  // 获取当前视图设置，如果不存在则使用默认值
  const viewSettings = getViewSettings(bookKey);
  
  // 字体设置状态
  const [overrideFont, setOverrideFont] = useState(viewSettings?.overrideFont ?? false);
  const [defaultFontSize, setDefaultFontSize] = useState(viewSettings?.defaultFontSize ?? 16);
  const [minFontSize, setMinFontSize] = useState(viewSettings?.minimumFontSize ?? 12);
  const [fontWeight, setFontWeight] = useState(viewSettings?.fontWeight ?? 400);
  const [defaultFont, setDefaultFont] = useState(viewSettings?.defaultFont ?? 'Sans-serif');
  const [defaultCJKFont, setDefaultCJKFont] = useState(viewSettings?.defaultCJKFont ?? 'LXGW WenKai');
  const [serifFont, setSerifFont] = useState(viewSettings?.serifFont ?? 'Bitter');
  const [sansSerifFont, setSansSerifFont] = useState(viewSettings?.sansSerifFont ?? 'Roboto');
  const [monospaceFont, setMonospaceFont] = useState(viewSettings?.monospaceFont ?? 'Consolas');

  const fontFamilyOptions = [
    {
      option: 'Serif',
      label: '衬线字体',
    },
    {
      option: 'Sans-serif', 
      label: '无衬线字体',
    },
  ];

  const resetToDefaults = () => {
    setOverrideFont(false); // 与readest保持一致
    setDefaultFontSize(16);
    setMinFontSize(8);
    setFontWeight(400);
    setDefaultFont('Serif');
    setDefaultCJKFont('LXGW WenKai'); // 使用本地字体
    setSerifFont('Bitter');
    setSansSerifFont('Roboto');
    setMonospaceFont('Consolas');
  };

  useEffect(() => {
    onRegisterReset(resetToDefaults);
    // Mark as initialized after first render
    isInitialized.current = true;
    
    console.log('📚 FontPanel初始化完成，当前设置:', getViewSettings(bookKey));
  }, [onRegisterReset, bookKey, getViewSettings]);

  // Update view settings using saveViewSetting to apply to book content
  const updateViewSetting = useCallback((key: string, value: any) => {
    // Don't update during initial render
    if (!isInitialized.current) return;
    
    console.log(`🎨 应用字体设置: ${key} = ${value}`);
    saveViewSetting(bookKey, key as any, value);
  }, [bookKey, saveViewSetting]);

  // Individual useEffects for each setting - 与LayoutPanel一致的模式
  useEffect(() => {
    updateViewSetting('overrideFont', overrideFont);
  }, [overrideFont, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('defaultFontSize', defaultFontSize);
  }, [defaultFontSize, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('minimumFontSize', minFontSize);
  }, [minFontSize, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('fontWeight', fontWeight);
  }, [fontWeight, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('defaultFont', defaultFont);
  }, [defaultFont, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('defaultCJKFont', defaultCJKFont);
  }, [defaultCJKFont, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('serifFont', serifFont);
  }, [serifFont, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('sansSerifFont', sansSerifFont);
  }, [sansSerifFont, updateViewSetting]);

  useEffect(() => {
    updateViewSetting('monospaceFont', monospaceFont);
  }, [monospaceFont, updateViewSetting]);

  const handleFontFamilyFont = (option: string) => {
    switch (option) {
      case 'Serif':
        return `'${serifFont}', serif`;
      case 'Sans-serif':
        return `'${sansSerifFont}', sans-serif`;
      case 'Monospace':
        return `'${monospaceFont}', monospace`;
      default:
        return 'serif';
    }
  };

  return (
    <div className='my-4 w-full space-y-6'>
      {/* 覆盖书籍字体 - 关键开关 */}
      <div className={`p-4 rounded-lg border-2 transition-all ${
        overrideFont 
          ? 'border-primary bg-primary/10' 
          : 'border-warning bg-warning/10'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">覆盖书籍字体</h2>
            {!overrideFont && (
              <span className="badge badge-warning badge-sm">重要</span>
            )}
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={overrideFont}
            onChange={() => setOverrideFont(!overrideFont)}
          />
        </div>
        <p className="text-sm opacity-70">
          {overrideFont 
            ? "✅ 已启用：字体设置将强制覆盖电子书原始字体"
            : "⚠️ 未启用：字体设置可能被电子书原始字体覆盖，如中文字体不生效时请启用此选项"
          }
        </p>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>字号</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <NumberInput
              label='默认字号'
              value={defaultFontSize}
              onChange={setDefaultFontSize}
              min={minFontSize}
              max={120}
            />
            <NumberInput
              label='最小字号'
              value={minFontSize}
              onChange={setMinFontSize}
              min={1}
              max={120}
            />
          </div>
        </div>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>字重</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <NumberInput
              label='字重'
              value={fontWeight}
              onChange={setFontWeight}
              min={100}
              max={900}
              step={100}
            />
          </div>
        </div>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>字族</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <div className='config-item'>
              <span className=''>默认字体</span>
                              <FontDropdown
                  options={fontFamilyOptions}
                  selected={defaultFont}
                onSelect={setDefaultFont}
                onGetFontFamily={handleFontFamilyFont}
              />
            </div>

            <FontFace
              className='config-item'
              family='serif'
              label='中文字体'
              options={CJK_FONTS_DISPLAY}
              selected={REVERSE_FONT_NAME_MAP[defaultCJKFont] || defaultCJKFont}
              onSelect={(option) => {
                // 保存映射后的字体名称到state
                const fontName = FONT_NAME_MAP[option] || option;
                console.log('🔤 选择中文字体:', option, '->', fontName);
                setDefaultCJKFont(fontName);
              }}
            />
            
            {/* 中文字体提示 */}
            {!overrideFont && (
              <div className="config-item bg-warning/20 border border-warning/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-warning">⚠️</span>
                  <span className="text-sm">中文字体设置可能不生效？请启用上方的"覆盖书籍字体"</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>字体</h2>
        <div className='card border-base-200 bg-base-100 border shadow'>
          <div className='divide-base-200 divide-y'>
            <FontFace
              className='config-item'
              family='serif'
              label='衬线字体'
              options={SERIF_FONTS}
              selected={serifFont}
              onSelect={setSerifFont}
            />
            <FontFace
              className='config-item'
              family='sans-serif'
              label='无衬线字体'
              options={SANS_SERIF_FONTS}
              selected={sansSerifFont}
              onSelect={setSansSerifFont}
            />
            <FontFace
              className='config-item'
              family='monospace'
              label='等宽字体'
              options={MONOSPACE_FONTS}
              selected={monospaceFont}
              onSelect={setMonospaceFont}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontPanel; 