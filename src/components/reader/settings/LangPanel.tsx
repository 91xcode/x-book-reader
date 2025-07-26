import React, { useEffect, useState } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { useSettingsStore } from '@/store/settingsStore';

interface LangPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const LangPanel: React.FC<LangPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getViewSettings, setViewSettings } = useReaderStore();
  const { settings } = useSettingsStore();
  const viewSettings = getViewSettings(bookKey);

  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translationProvider, setTranslationProvider] = useState('google');

  const languages = [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
  ];

  const translationProviders = [
    { value: 'google', label: 'Google 翻译' },
    { value: 'baidu', label: '百度翻译' },
    { value: 'youdao', label: '有道翻译' },
    { value: 'deepl', label: 'DeepL' },
  ];

  const resetToDefaults = () => {
    setSelectedLanguage('zh-CN');
    setTranslationEnabled(false);
    setAutoTranslate(false);
    setTranslationProvider('google');
  };

  useEffect(() => {
    onRegisterReset(resetToDefaults);
  }, [onRegisterReset]);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    // Here you would implement actual language switching logic
  };

  const handleTranslationToggle = () => {
    setTranslationEnabled(!translationEnabled);
  };

  const handleAutoTranslateToggle = () => {
    setAutoTranslate(!autoTranslate);
  };

  const handleProviderChange = (provider: string) => {
    setTranslationProvider(provider);
  };

  return (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">界面语言</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            {languages.map((lang) => (
              <div key={lang.code} className="config-item flex items-center justify-between p-4">
                <span>{lang.name}</span>
                <input
                  type="radio"
                  name="language"
                  value={lang.code}
                  checked={selectedLanguage === lang.code}
                  onChange={() => handleLanguageChange(lang.code)}
                  className="radio"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">翻译设置</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>启用翻译功能</span>
              <input
                type="checkbox"
                className="toggle"
                checked={translationEnabled}
                onChange={handleTranslationToggle}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>自动翻译选中文本</span>
              <input
                type="checkbox"
                className="toggle"
                checked={autoTranslate}
                onChange={handleAutoTranslateToggle}
                disabled={!translationEnabled}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>翻译服务商</span>
              <select
                value={translationProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="select select-bordered w-full max-w-xs"
                disabled={!translationEnabled}
              >
                {translationProviders.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">字典设置</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>启用内置词典</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={true}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>双击查词</span>
              <input
                type="checkbox"
                className="toggle"
                defaultChecked={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LangPanel; 