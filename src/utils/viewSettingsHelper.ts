import { ViewSettings } from '@/types/book';
import { useSettingsStore } from '@/store/settingsStore';
import { useReaderStore } from '@/store/readerStore';
import { getCompleteStyles } from '@/utils/style';
import { getMainPageFontStyles } from '@/utils/fontStyles';
import { useCallback } from 'react';

/**
 * 视图设置同步助手
 * 用于在全局设置和书籍特定设置之间同步布局设置
 */
export const useViewSettingsSync = () => {
  const { settings, isFontLayoutSettingsGlobal } = useSettingsStore();
  const { getView, getViewSettings, setViewSettings } = useReaderStore();

  /**
   * 将全局设置应用到指定书籍
   */
  const applyGlobalSettingsToBook = useCallback((bookKey: string) => {
    const currentSettings = getViewSettings(bookKey);
    if (!currentSettings) return;

    const globalSettings = settings.globalViewSettings;
    const updatedSettings = {
      ...currentSettings,
      ...globalSettings,
    };

    setViewSettings(bookKey, updatedSettings);
    
    // 应用样式 - 使用getCompleteStyles
    const view = getView(bookKey);
    if (view?.renderer?.setStyles) {
      console.log('🎨 应用全局设置到书籍:', bookKey, updatedSettings);
      view.renderer.setStyles(getCompleteStyles(updatedSettings));
    }
  }, [getViewSettings, setViewSettings, getView, settings.globalViewSettings]);

  /**
   * 初始化书籍设置（如果启用全局设置，则使用全局设置）
   */
  const initializeBookSettings = useCallback((bookKey: string, defaultSettings?: Partial<ViewSettings>) => {
    const existingSettings = getViewSettings(bookKey);
    if (existingSettings) return; // 已经初始化

    const settingsToUse = isFontLayoutSettingsGlobal && settings.globalViewSettings
      ? { ...defaultSettings, ...settings.globalViewSettings }
      : defaultSettings;

    if (settingsToUse) {
      setViewSettings(bookKey, settingsToUse as ViewSettings);
    }
  }, [getViewSettings, setViewSettings, isFontLayoutSettingsGlobal, settings.globalViewSettings]);

  // 🎯 模仿readest的saveViewSettings - 简洁高效版本
  const saveViewSettings = useCallback(async <K extends keyof ViewSettings>(
    bookKey: string,
    key: K,
    value: ViewSettings[K],
    skipGlobal = false,
    applyStyles = true,
  ) => {
    const viewSettings = getViewSettings(bookKey);
    if (!viewSettings) {
      console.warn(`⚠️ 未找到书籍设置: ${bookKey} - 跳过设置 ${key}`);
      return;
    }

    // 🎯 只在值真正改变时才处理
    if (viewSettings[key] !== value) {
      viewSettings[key] = value;
      
      // 🎨 立即应用样式到renderer
      if (applyStyles) {
        const view = getView(bookKey);
        view?.renderer?.setStyles?.(getCompleteStyles(viewSettings));
      }
    }
    
    setViewSettings(bookKey, viewSettings);

    // TODO: 未来可以添加全局设置处理和持久化保存
    // if (isFontLayoutSettingsGlobal && !skipGlobal) {
    //   settings.globalViewSettings[key] = value;
    //   setSettings(settings);
    // }
    // await saveConfig(envConfig, bookKey, config, settings);
    // await saveSettings(envConfig, settings);
  }, [getView, getViewSettings, setViewSettings]);

  return {
    applyGlobalSettingsToBook,
    initializeBookSettings,
    saveViewSettings,
    isFontLayoutSettingsGlobal,
  };
};

/**
 * 重置视图设置到默认值
 */
export const useResetViewSettings = () => {
  const { settings } = useSettingsStore();
  
  const resetToDefaults = (setters: Record<string, (value: any) => void>) => {
    const defaultSettings = settings.globalViewSettings;

    Object.entries(setters).forEach(([settingKey, setter]) => {
      const freshValue = (defaultSettings as any)[settingKey];
      if (freshValue !== undefined) {
        setter(freshValue);
      }
    });
  };

  return resetToDefaults;
}; 