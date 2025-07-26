import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { useReaderStore } from '@/store/readerStore';
import NumberInput from './NumberInput';
import FontDropdown from './FontDropdown';

interface FontPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const FontPanel: React.FC<FontPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getView, getViewSettings, setViewSettings } = useReaderStore();
  const viewSettings = getViewSettings(bookKey);
  const view = getView(bookKey);

  const [defaultFontSize, setDefaultFontSize] = useState(viewSettings?.defaultFontSize || 16);
  const [minFontSize, setMinFontSize] = useState(viewSettings?.minimumFontSize || 8);
  const [fontWeight, setFontWeight] = useState(viewSettings?.fontWeight || 400);
  const [defaultFont, setDefaultFont] = useState(viewSettings?.defaultFont || 'Serif');
  const [defaultCJKFont, setDefaultCJKFont] = useState(viewSettings?.defaultCJKFont || '霞鹜文楷');
  const [serifFont, setSerifFont] = useState(viewSettings?.serifFont || 'Times New Roman');
  const [sansSerifFont, setSansSerifFont] = useState(viewSettings?.sansSerifFont || 'Arial');
  const [monospaceFont, setMonospaceFont] = useState(viewSettings?.monospaceFont || 'Courier New');
  const [overrideFont, setOverrideFont] = useState(viewSettings?.overrideFont || false);

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

  const cjkFontOptions = [
    {
      option: '霞鹜文楷',
      label: '霞鹜文楷',
    },
    {
      option: 'LXGW WenKai',
      label: 'LXGW WenKai',
    },
    {
      option: 'Noto Sans CJK SC',
      label: 'Noto Sans CJK SC',
    },
  ];

  const serifFontOptions = [
    {
      option: 'Times New Roman',
      label: 'Times New Roman',
    },
    {
      option: 'Georgia',
      label: 'Georgia',
    },
    {
      option: 'Palatino',
      label: 'Palatino',
    },
  ];

  const sansSerifFontOptions = [
    {
      option: 'Arial',
      label: 'Arial',
    },
    {
      option: 'Helvetica',
      label: 'Helvetica',
    },
    {
      option: 'Verdana',
      label: 'Verdana',
    },
  ];

  const monospaceFontOptions = [
    {
      option: 'Courier New',
      label: 'Courier New',
    },
    {
      option: 'Consolas',
      label: 'Consolas',
    },
    {
      option: 'Monaco',
      label: 'Monaco',
    },
  ];

  const resetToDefaults = () => {
    setDefaultFontSize(16);
    setMinFontSize(8);
    setFontWeight(400);
    setDefaultFont('Serif');
    setDefaultCJKFont('霞鹜文楷');
    setSerifFont('Times New Roman');
    setSansSerifFont('Arial');
    setMonospaceFont('Courier New');
    setOverrideFont(false);
  };

  useEffect(() => {
    onRegisterReset(resetToDefaults);
  }, [onRegisterReset]);

  useEffect(() => {
    if (viewSettings && viewSettings.defaultFontSize !== defaultFontSize) {
      const updatedSettings = { ...viewSettings, defaultFontSize };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用字体大小到视图
      if (view?.renderer) {
        const fontStyles = `
          html, body {
            font-size: ${defaultFontSize}px !important;
          }
        `;
        view.renderer.setStyles?.(fontStyles);
      }
    }
  }, [defaultFontSize, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.minimumFontSize !== minFontSize) {
      const updatedSettings = { ...viewSettings, minimumFontSize: minFontSize };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [minFontSize, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.fontWeight !== fontWeight) {
      const updatedSettings = { ...viewSettings, fontWeight };
      setViewSettings(bookKey, updatedSettings);
      
      // 应用字重到视图
      if (view?.renderer) {
        const fontWeightStyle = `
          html, body {
            font-weight: ${fontWeight} !important;
          }
        `;
        view.renderer.setStyles?.(fontWeightStyle);
      }
    }
  }, [fontWeight, viewSettings, bookKey, setViewSettings, view]);

  useEffect(() => {
    if (viewSettings && viewSettings.defaultFont !== defaultFont) {
      const updatedSettings = { ...viewSettings, defaultFont };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [defaultFont, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.defaultCJKFont !== defaultCJKFont) {
      const updatedSettings = { ...viewSettings, defaultCJKFont };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [defaultCJKFont, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.serifFont !== serifFont) {
      const updatedSettings = { ...viewSettings, serifFont };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [serifFont, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.sansSerifFont !== sansSerifFont) {
      const updatedSettings = { ...viewSettings, sansSerifFont };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [sansSerifFont, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.monospaceFont !== monospaceFont) {
      const updatedSettings = { ...viewSettings, monospaceFont };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [monospaceFont, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.overrideFont !== overrideFont) {
      const updatedSettings = { ...viewSettings, overrideFont };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [overrideFont, viewSettings, bookKey, setViewSettings]);

  const handleFontFamilyFont = (option: string) => {
    switch (option) {
      case 'Serif':
        return 'serif';
      case 'Sans-serif':
        return 'sans-serif';
      default:
        return 'serif';
    }
  };

  const handleFontFaceFont = (option: string, family: string) => {
    return `'${option}', ${family}`;
  };

  return (
    <div className="my-4 w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">覆盖书籍字体</h2>
        <input
          type="checkbox"
          className="toggle"
          checked={overrideFont}
          onChange={() => setOverrideFont(!overrideFont)}
        />
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字号</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <NumberInput
              label="默认字号"
              value={defaultFontSize}
              onChange={setDefaultFontSize}
              min={minFontSize}
              max={120}
            />
            <NumberInput
              label="最小字号"
              value={minFontSize}
              onChange={setMinFontSize}
              min={1}
              max={120}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字重</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <NumberInput
              label="字重"
              value={fontWeight}
              onChange={setFontWeight}
              min={100}
              max={900}
              step={100}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字族</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>默认字体</span>
              <FontDropdown
                options={fontFamilyOptions}
                selected={defaultFont}
                onSelect={setDefaultFont}
                onGetFontFamily={handleFontFamilyFont}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>中文字体</span>
              <FontDropdown
                options={cjkFontOptions}
                selected={defaultCJKFont}
                onSelect={setDefaultCJKFont}
                onGetFontFamily={(option) => option}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字体</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>衬线字体</span>
              <FontDropdown
                family="serif"
                options={serifFontOptions}
                selected={serifFont}
                onSelect={setSerifFont}
                onGetFontFamily={handleFontFaceFont}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>无衬线字体</span>
              <FontDropdown
                family="sans-serif"
                options={sansSerifFontOptions}
                selected={sansSerifFont}
                onSelect={setSansSerifFont}
                onGetFontFamily={handleFontFaceFont}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>等宽字体</span>
              <FontDropdown
                family="monospace"
                options={monospaceFontOptions}
                selected={monospaceFont}
                onSelect={setMonospaceFont}
                onGetFontFamily={handleFontFaceFont}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontPanel; 