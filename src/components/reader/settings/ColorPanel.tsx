import React, { useEffect, useState } from 'react';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { MdRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md';
import { CgColorPicker } from 'react-icons/cg';
import { TbSunMoon } from 'react-icons/tb';
import { PiPlus } from 'react-icons/pi';

import { useReaderStore } from '@/store/readerStore';
import { useSettingsStore } from '@/store/settingsStore';

interface ColorPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const ColorPanel: React.FC<ColorPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getView, getViewSettings, setViewSettings } = useReaderStore();
  const { setThemeMode, setThemeColor } = useSettingsStore();
  const viewSettings = getViewSettings(bookKey);
  const view = getView(bookKey);

  const [invertImgColorInDark, setInvertImgColorInDark] = useState(
    viewSettings?.invertImgColorInDark ?? false
  );
  const [overrideColor, setOverrideColor] = useState(viewSettings?.overrideColor ?? false);
  const [codeHighlighting, setCodeHighlighting] = useState(viewSettings?.codeHighlighting ?? false);
  const [codeLanguage, setCodeLanguage] = useState(viewSettings?.codeLanguage ?? 'javascript');

  const themes = [
    { value: 'light', label: '浅色', icon: MdOutlineLightMode },
    { value: 'dark', label: '深色', icon: MdOutlineDarkMode },
    { value: 'sepia', label: '护眼', icon: TbSunMoon },
    { value: 'auto', label: '跟随系统', icon: CgColorPicker },
  ];

  const codeLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
  ];

  const resetToDefaults = () => {
    setInvertImgColorInDark(false);
    setOverrideColor(false);
    setCodeHighlighting(false);
    setCodeLanguage('javascript');
    setThemeColor('default');
    setThemeMode('auto');
  };

  useEffect(() => {
    onRegisterReset(resetToDefaults);
  }, [onRegisterReset]);

  useEffect(() => {
    if (viewSettings && viewSettings.invertImgColorInDark !== invertImgColorInDark) {
      const updatedSettings = { ...viewSettings, invertImgColorInDark };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [invertImgColorInDark, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.overrideColor !== overrideColor) {
      const updatedSettings = { ...viewSettings, overrideColor };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [overrideColor, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.codeHighlighting !== codeHighlighting) {
      const updatedSettings = { ...viewSettings, codeHighlighting };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [codeHighlighting, viewSettings, bookKey, setViewSettings]);

  useEffect(() => {
    if (viewSettings && viewSettings.codeLanguage !== codeLanguage) {
      const updatedSettings = { ...viewSettings, codeLanguage };
      setViewSettings(bookKey, updatedSettings);
    }
  }, [codeLanguage, viewSettings, bookKey, setViewSettings]);

  const handleThemeChange = (theme: string) => {
    setThemeMode(theme as 'light' | 'dark' | 'sepia' | 'auto');
  };

  return (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">主题</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            {themes.map((theme) => {
              const Icon = theme.icon;
              return (
                <div key={theme.value} className="config-item flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="text-lg" />
                    <span>{theme.label}</span>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={viewSettings?.theme === theme.value}
                    onChange={() => handleThemeChange(theme.value)}
                    className="radio"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">显示选项</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>深色模式下反转图片颜色</span>
              <input
                type="checkbox"
                className="toggle"
                checked={invertImgColorInDark}
                onChange={() => setInvertImgColorInDark(!invertImgColorInDark)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>覆盖书籍颜色</span>
              <input
                type="checkbox"
                className="toggle"
                checked={overrideColor}
                onChange={() => setOverrideColor(!overrideColor)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">代码高亮</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>启用代码高亮</span>
              <input
                type="checkbox"
                className="toggle"
                checked={codeHighlighting}
                onChange={() => setCodeHighlighting(!codeHighlighting)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>默认语言</span>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="select select-bordered w-full max-w-xs"
                disabled={!codeHighlighting}
              >
                {codeLanguages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">自定义主题</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="p-4">
            <button className="btn btn-outline btn-sm w-full">
              <PiPlus className="mr-2" />
              创建自定义主题
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPanel; 