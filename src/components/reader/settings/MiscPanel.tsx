import React, { useEffect, useState } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { useSettingsStore } from '@/store/settingsStore';

interface MiscPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const MiscPanel: React.FC<MiscPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getViewSettings, setViewSettings } = useReaderStore();
  const { settings, setSettings } = useSettingsStore();
  const viewSettings = getViewSettings(bookKey);

  // Reading preferences
  const [autoSave, setAutoSave] = useState(true);
  const [autoBookmark, setAutoBookmark] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [enableSounds, setEnableSounds] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enableGestures, setEnableGestures] = useState(true);

  // Accessibility
  const [screenReaderSupport, setScreenReaderSupport] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Advanced
  const [debugMode, setDebugMode] = useState(false);
  const [enableDeveloperTools, setEnableDeveloperTools] = useState(false);
  const [cacheEnabled, setCacheEnabled] = useState(true);

  const resetToDefaults = () => {
    setAutoSave(true);
    setAutoBookmark(true);
    setFullscreenMode(false);
    setEnableSounds(false);
    setEnableAnimations(true);
    setEnableGestures(true);
    setScreenReaderSupport(false);
    setHighContrastMode(false);
    setReducedMotion(false);
    setDebugMode(false);
    setEnableDeveloperTools(false);
    setCacheEnabled(true);
  };

  useEffect(() => {
    onRegisterReset(resetToDefaults);
  }, [onRegisterReset]);

  const handleClearCache = () => {
    // Clear application cache
    if (confirm('确定要清除所有缓存数据吗？这将删除已下载的书籍和设置。')) {
      localStorage.clear();
      alert('缓存已清除，请重启应用。');
    }
  };

  const handleExportSettings = () => {
    // Export settings to file
    const settingsData = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reader-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    // Import settings from file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string);
            setSettings(importedSettings);
            alert('设置导入成功！');
          } catch (error) {
            alert('设置文件格式错误！');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="my-4 w-full space-y-6">
      <div className="w-full">
        <h2 className="mb-2 font-medium">阅读偏好</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>自动保存进度</span>
              <input
                type="checkbox"
                className="toggle"
                checked={autoSave}
                onChange={() => setAutoSave(!autoSave)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>自动书签</span>
              <input
                type="checkbox"
                className="toggle"
                checked={autoBookmark}
                onChange={() => setAutoBookmark(!autoBookmark)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>全屏模式</span>
              <input
                type="checkbox"
                className="toggle"
                checked={fullscreenMode}
                onChange={() => setFullscreenMode(!fullscreenMode)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>启用音效</span>
              <input
                type="checkbox"
                className="toggle"
                checked={enableSounds}
                onChange={() => setEnableSounds(!enableSounds)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>启用动画</span>
              <input
                type="checkbox"
                className="toggle"
                checked={enableAnimations}
                onChange={() => setEnableAnimations(!enableAnimations)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>启用手势操作</span>
              <input
                type="checkbox"
                className="toggle"
                checked={enableGestures}
                onChange={() => setEnableGestures(!enableGestures)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">无障碍</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>屏幕阅读器支持</span>
              <input
                type="checkbox"
                className="toggle"
                checked={screenReaderSupport}
                onChange={() => setScreenReaderSupport(!screenReaderSupport)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>高对比度模式</span>
              <input
                type="checkbox"
                className="toggle"
                checked={highContrastMode}
                onChange={() => setHighContrastMode(!highContrastMode)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>减少动画</span>
              <input
                type="checkbox"
                className="toggle"
                checked={reducedMotion}
                onChange={() => setReducedMotion(!reducedMotion)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">高级设置</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>启用缓存</span>
              <input
                type="checkbox"
                className="toggle"
                checked={cacheEnabled}
                onChange={() => setCacheEnabled(!cacheEnabled)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>调试模式</span>
              <input
                type="checkbox"
                className="toggle"
                checked={debugMode}
                onChange={() => setDebugMode(!debugMode)}
              />
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>开发者工具</span>
              <input
                type="checkbox"
                className="toggle"
                checked={enableDeveloperTools}
                onChange={() => setEnableDeveloperTools(!enableDeveloperTools)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">数据管理</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="divide-base-200 divide-y">
            <div className="config-item flex items-center justify-between p-4">
              <span>导出设置</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleExportSettings}
              >
                导出
              </button>
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>导入设置</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleImportSettings}
              >
                导入
              </button>
            </div>
            <div className="config-item flex items-center justify-between p-4">
              <span>清除缓存</span>
              <button
                className="btn btn-outline btn-error btn-sm"
                onClick={handleClearCache}
              >
                清除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="mb-2 font-medium">关于</h2>
        <div className="card border-base-200 bg-base-100 border shadow">
          <div className="p-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium">版本:</span> 1.0.0
            </div>
            <div className="text-sm">
              <span className="font-medium">构建日期:</span> {new Date().toLocaleDateString()}
            </div>
            <div className="text-sm">
              <span className="font-medium">技术栈:</span> Electron + Next.js + TypeScript
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiscPanel; 