// 🌐 简化版翻译hook - 基于readest风格

const translations = {
  // 滚动设置
  'Scroll': '滚动',
  'Scrolled Mode': '滚动模式',
  'Continuous Scroll': '连续滚动',
  'Overlap Pixels': '重叠像素',
  
  // 点击设置
  'Click': '点击',
  'Clicks for Page Flip': '点击翻页',
  'Swap Clicks Area': '交换点击区域',
  'Volume Keys for Page Flip': '音量键翻页',
  
  // 动画设置
  'Animation': '动画',
  'Enable Animation': '启用动画',
  
  // 脚本设置
  'Script': '脚本',
  'Allow Script': '允许脚本',
  
  // 通用
  'Settings': '设置',
  'Reset': '重置',
  'Apply': '应用',
  'Cancel': '取消',
  'Save': '保存',
};

export const useTranslation = () => {
  const t = (key: string): string => {
    return translations[key as keyof typeof translations] || key;
  };

  // 兼容readest的_函数命名
  const _ = t;

  return { t, _ };
};

export default useTranslation; 