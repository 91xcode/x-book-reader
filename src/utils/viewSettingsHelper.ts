import { ViewSettings } from '@/types/book';
import { useSettingsStore } from '@/store/settingsStore';
import { useReaderStore } from '@/store/readerStore';
import { getStyles } from '@/utils/style';

/**
 * 视图设置同步助手
 * 用于在全局设置和书籍特定设置之间同步布局设置
 */
export const useViewSettingsSync = () => {
  const { settings, isFontLayoutSettingsGlobal } = useSettingsStore();
  const { getViewSettings, setViewSettings, getView } = useReaderStore();

  /**
   * 将全局设置应用到指定书籍
   */
  const applyGlobalSettingsToBook = (bookKey: string) => {
    const currentSettings = getViewSettings(bookKey);
    if (!currentSettings) return;

    const globalSettings = settings.globalViewSettings;
    const updatedSettings = {
      ...currentSettings,
      ...globalSettings,
    };

    setViewSettings(bookKey, updatedSettings);
    
    // 应用样式
    const view = getView(bookKey);
    if (view?.renderer?.setStyles) {
      view.renderer.setStyles(getStyles(updatedSettings));
    }
  };

  /**
   * 初始化书籍设置（如果启用全局设置，则使用全局设置）
   */
  const initializeBookSettings = (bookKey: string, defaultSettings?: Partial<ViewSettings>) => {
    const existingSettings = getViewSettings(bookKey);
    
    if (!existingSettings) {
      const baseSettings = isFontLayoutSettingsGlobal 
        ? settings.globalViewSettings 
        : { ...settings.globalViewSettings, ...defaultSettings };
        
      setViewSettings(bookKey, baseSettings as ViewSettings);
    }
  };

  /**
   * 保存设置到适当的位置（全局或书籍特定）并立即应用样式
   */
  const saveViewSetting = (
    bookKey: string, 
    key: keyof ViewSettings, 
    value: any, 
    skipGlobal = false,
    applyStyles = true
  ) => {
    const currentSettings = getViewSettings(bookKey);
    if (!currentSettings) return;

    // 检查值是否真的改变了
    if (currentSettings[key] === value) return;

    const updatedSettings = { ...currentSettings, [key]: value };
    setViewSettings(bookKey, updatedSettings);

    // 立即应用样式
    if (applyStyles) {
      const view = getView(bookKey);
      if (view?.renderer?.setStyles) {
        view.renderer.setStyles(getStyles(updatedSettings));
      }
    }

    // 如果启用全局设置且未跳过全局更新，则同时更新全局设置
    if (isFontLayoutSettingsGlobal && !skipGlobal) {
      const { updateGlobalViewSettings } = useSettingsStore.getState();
      updateGlobalViewSettings({ [key]: value });
    }

    // TODO: 保存到持久化存储
    // 这里应该调用类似 saveConfig 和 saveSettings 的函数
    console.log(`Setting ${String(key)} = ${value} for book ${bookKey}`);
  };

  return {
    applyGlobalSettingsToBook,
    initializeBookSettings,
    saveViewSetting,
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