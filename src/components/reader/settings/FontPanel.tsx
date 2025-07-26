import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { useSettingsStore } from '@/store/settingsStore';
import NumberInput from './NumberInput';
import FontDropdown from './FontDropdown';

interface FontPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

// Font constants - simplified for demo
const CJK_FONTS = ['霞鹜文楷', '微软雅黑', 'PingFang SC', '宋体', '黑体', '楷体', 'Hiragino Sans GB'];
const SERIF_FONTS = ['Georgia', 'Times New Roman', 'Book Antiqua', 'Palatino'];
const SANS_SERIF_FONTS = ['Arial', 'Helvetica', 'Tahoma', 'Verdana', 'Trebuchet MS'];
const MONOSPACE_FONTS = ['Courier New', 'Consolas', 'Monaco', 'Menlo'];

// 字体名称映射：界面显示名称 -> CSS字体名称
const FONT_NAME_MAP: Record<string, string> = {
  '霞鹜文楷': 'LXGW WenKai GB Screen',
  '微软雅黑': 'Microsoft YaHei',
  '宋体': 'SimSun',
  '黑体': 'SimHei',
  '楷体': 'KaiTi',
};

// 反向映射：CSS字体名称 -> 界面显示名称
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
  const { getViewSettings, setViewSettings } = useReaderStore();
  const viewSettings = getViewSettings(bookKey);
  const isInitialized = useRef(false);

  // Font state
  const [overrideFont, setOverrideFont] = useState(viewSettings?.overrideFont ?? true);
  const [defaultFontSize, setDefaultFontSize] = useState(viewSettings?.defaultFontSize ?? 16);
  const [minFontSize, setMinFontSize] = useState(viewSettings?.minimumFontSize ?? 8);
  const [fontWeight, setFontWeight] = useState(viewSettings?.fontWeight ?? 400);
  const [defaultFont, setDefaultFont] = useState(viewSettings?.defaultFont ?? 'Serif');
  const [defaultCJKFont, setDefaultCJKFont] = useState(viewSettings?.defaultCJKFont ?? 'LXGW WenKai GB Screen');
  const [serifFont, setSerifFont] = useState(viewSettings?.serifFont ?? 'Georgia');
  const [sansSerifFont, setSansSerifFont] = useState(viewSettings?.sansSerifFont ?? 'Arial');
  const [monospaceFont, setMonospaceFont] = useState(viewSettings?.monospaceFont ?? 'Courier New');

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
    setOverrideFont(true);
    setDefaultFontSize(16);
    setMinFontSize(8);
    setFontWeight(400);
    setDefaultFont('Serif');
    setDefaultCJKFont('LXGW WenKai GB Screen');
    setSerifFont('Georgia');
    setSansSerifFont('Arial');
    setMonospaceFont('Courier New');
  };

  useEffect(() => {
    onRegisterReset(resetToDefaults);
    // Mark as initialized after first render
    isInitialized.current = true;
  }, [onRegisterReset]);

  // Update view settings when font values change
  const updateViewSettings = useCallback((newSettings: Partial<any>) => {
    // Don't update during initial render
    if (!isInitialized.current) return;
    
    const currentSettings = getViewSettings(bookKey);
    if (currentSettings) {
      const updatedSettings = {
        ...currentSettings,
        ...newSettings,
      };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [bookKey, getViewSettings, setViewSettings]);

  // Individual useEffects for each setting
  useEffect(() => {
    updateViewSettings({ overrideFont });
  }, [overrideFont, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ defaultFontSize });
  }, [defaultFontSize, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ minimumFontSize: minFontSize });
  }, [minFontSize, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ fontWeight });
  }, [fontWeight, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ defaultFont });
  }, [defaultFont, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ defaultCJKFont });
  }, [defaultCJKFont, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ serifFont });
  }, [serifFont, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ sansSerifFont });
  }, [sansSerifFont, updateViewSettings]);

  useEffect(() => {
    updateViewSettings({ monospaceFont });
  }, [monospaceFont, updateViewSettings]);

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
      <div className='flex items-center justify-between'>
        <h2 className=''>覆盖书籍字体</h2>
        <input
          type='checkbox'
          className='toggle'
          checked={overrideFont}
          onChange={() => setOverrideFont(!overrideFont)}
        />
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
              options={CJK_FONTS}
              selected={REVERSE_FONT_NAME_MAP[defaultCJKFont] || defaultCJKFont}
              onSelect={(option) => {
                // 保存映射后的字体名称到state
                const fontName = FONT_NAME_MAP[option] || option;
                setDefaultCJKFont(fontName);
              }}
            />
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