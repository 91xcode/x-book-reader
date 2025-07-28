import { ViewSettings } from '@/types/book';

// 🎯 readest风格的配置工具函数

/**
 * 获取最大内联尺寸（宽度）
 * 根据滚动模式和布局设置计算合适的最大宽度
 */
export const getMaxInlineSize = (viewSettings: ViewSettings): number => {
  // 基础最大宽度
  const baseMaxWidth = viewSettings.maxInlineSize || 720;
  
  // 如果是滚动模式，使用较大的宽度以获得更好的阅读体验
  if (viewSettings.scrolled) {
    return Math.min(baseMaxWidth, 900);
  }
  
  // 分页模式使用标准宽度
  return baseMaxWidth;
};

/**
 * 获取最大块尺寸（高度）
 */
export const getMaxBlockSize = (viewSettings: ViewSettings): number => {
  return viewSettings.maxBlockSize || 1440;
};

/**
 * 获取列数配置
 */
export const getMaxColumnCount = (viewSettings: ViewSettings): number => {
  return viewSettings.maxColumnCount || 2;
};

/**
 * 检查是否需要显示头部/底部栏
 */
export const shouldShowBars = (viewSettings: ViewSettings): boolean => {
  return viewSettings.showBarsOnScroll ?? true;
};

/**
 * 计算滚动距离
 */
export const calculateScrollDistance = (
  renderer: any, 
  viewSettings: ViewSettings
): number => {
  const { size } = renderer;
  const showHeader = viewSettings.showHeader && shouldShowBars(viewSettings);
  const showFooter = viewSettings.showFooter && shouldShowBars(viewSettings);
  const scrollingOverlap = viewSettings.scrollingOverlap || 0;
  
  return size - scrollingOverlap - (showHeader ? 44 : 0) - (showFooter ? 44 : 0);
}; 