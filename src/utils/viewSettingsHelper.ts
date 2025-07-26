import { ViewSettings } from '@/types/book';
import { useSettingsStore } from '@/store/settingsStore';
import { useReaderStore } from '@/store/readerStore';
import { getCompleteStyles } from '@/utils/style';

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
    
    // 应用样式 - 使用getCompleteStyles
    const view = getView(bookKey);
    if (view?.renderer?.setStyles) {
      console.log('🎨 应用全局设置到书籍:', bookKey, updatedSettings);
      view.renderer.setStyles(getCompleteStyles(updatedSettings));
    }
  };

  /**
   * 初始化书籍设置（如果启用全局设置，则使用全局设置）
   */
  const initializeBookSettings = (bookKey: string, defaultSettings?: Partial<ViewSettings>) => {
    const existingSettings = getViewSettings(bookKey);
    if (existingSettings) return; // 已经初始化

    const settingsToUse = isFontLayoutSettingsGlobal && settings.globalViewSettings
      ? { ...defaultSettings, ...settings.globalViewSettings }
      : defaultSettings;

    if (settingsToUse) {
      setViewSettings(bookKey, settingsToUse as ViewSettings);
    }
  };

  /**
   * 保存单个视图设置并立即应用样式
   */
  const saveViewSetting = (
    bookKey: string, 
    key: keyof ViewSettings, 
    value: any, 
    skipGlobal = false,
    applyStyles = true
  ) => {
    const currentSettings = getViewSettings(bookKey);
    if (!currentSettings) {
      console.warn(`⚠️ 未找到书籍设置: ${bookKey}`);
      return;
    }

    // 检查值是否真的改变了
    if (currentSettings[key] === value) {
      console.log(`📝 设置值未变化，跳过: ${key} = ${value}`);
      return;
    }

    const updatedSettings = { ...currentSettings, [key]: value };
    
    // 特别记录字体大小变化
    if (key === 'defaultFontSize') {
      console.log(`🔤 字体大小变化: ${currentSettings[key]} → ${value}px`);
    }
    
    console.log(`🎨 保存视图设置: ${key} = ${value}`, {
      旧值: currentSettings[key],
      新值: value,
      书籍: bookKey
    });

    // 🔥 关键修复：像readest一样立即应用样式
    if (applyStyles) {
      const view = getView(bookKey);
      if (view?.renderer?.setStyles) {
        const styles = getCompleteStyles(updatedSettings);
        view.renderer.setStyles(styles);
        console.log('🎯 立即应用样式（readest方式）');
      } else {
        console.warn('⚠️ 未找到view或renderer，无法应用样式');
      }
    }

    // 更新store
    setViewSettings(bookKey, updatedSettings);

    // 如果启用全局设置且未跳过全局更新，则同时更新全局设置
    if (isFontLayoutSettingsGlobal && !skipGlobal) {
      const { updateGlobalViewSettings } = useSettingsStore.getState();
      updateGlobalViewSettings({ [key]: value });
    }

    // TODO: 保存到持久化存储
    // 这里应该调用类似 saveConfig 和 saveSettings 的函数
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