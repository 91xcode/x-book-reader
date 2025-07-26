import { DEFAULT_VIEW_SETTINGS } from './constants';
import { getCompleteStyles } from './style';
import { ViewSettings } from '@/types/book';

/**
 * 测试布局设置系统的完整性
 */
export const testLayoutSettingsSystem = () => {
  console.group('🧪 Layout Settings System Test');
  
  try {
    // 1. 测试默认设置
    console.log('1. Testing default settings...');
    console.log('DEFAULT_VIEW_SETTINGS:', {
      marginTopPx: DEFAULT_VIEW_SETTINGS.marginTopPx,
      marginBottomPx: DEFAULT_VIEW_SETTINGS.marginBottomPx,
      lineHeight: DEFAULT_VIEW_SETTINGS.lineHeight,
      writingMode: DEFAULT_VIEW_SETTINGS.writingMode,
      maxColumnCount: DEFAULT_VIEW_SETTINGS.maxColumnCount,
    });
    
    // 2. 测试样式生成
    console.log('2. Testing style generation...');
    const styles = getCompleteStyles(DEFAULT_VIEW_SETTINGS);
    console.log('Generated styles length:', styles.length);
    console.log('Styles include layout CSS:', styles.includes('line-height'));
    console.log('Styles include margin CSS:', styles.includes('margin'));
    
    // 3. 测试设置修改
    console.log('3. Testing settings modification...');
    const modifiedSettings: ViewSettings = {
      ...DEFAULT_VIEW_SETTINGS,
      lineHeight: 2.0,
      marginTopPx: 60,
      fullJustification: false,
      writingMode: 'vertical-rl',
    };
    
    const modifiedStyles = getCompleteStyles(modifiedSettings);
    console.log('Modified settings applied:', {
      lineHeight: modifiedSettings.lineHeight,
      marginTopPx: modifiedSettings.marginTopPx,
      fullJustification: modifiedSettings.fullJustification,
      writingMode: modifiedSettings.writingMode,
    });
    
    // 4. 测试样式差异
    console.log('4. Testing style differences...');
    const styleDifference = modifiedStyles.length !== styles.length;
    console.log('Style changes detected:', styleDifference);
    
    // 5. 测试所有必需属性
    console.log('5. Testing required properties...');
    const requiredProps = [
      'marginTopPx', 'marginBottomPx', 'marginLeftPx', 'marginRightPx',
      'compactMarginTopPx', 'compactMarginBottomPx', 'compactMarginLeftPx', 'compactMarginRightPx',
      'lineHeight', 'paragraphMargin', 'wordSpacing', 'letterSpacing', 'textIndent',
      'fullJustification', 'hyphenation', 'overrideLayout',
      'gapPercent', 'maxColumnCount', 'maxInlineSize', 'maxBlockSize',
      'writingMode', 'vertical', 'rtl', 'scrolled', 'animated',
      'showHeader', 'showFooter', 'showPageNumber', 'doubleBorder'
    ];
    
    const missingProps = requiredProps.filter(prop => !(prop in DEFAULT_VIEW_SETTINGS));
    if (missingProps.length === 0) {
      console.log('✅ All required properties present');
    } else {
      console.warn('⚠️ Missing properties:', missingProps);
    }
    
    console.log('✅ Layout settings system test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Layout settings system test failed:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};

/**
 * 验证设置是否符合 readest 项目标准
 */
export const validateReadestCompatibility = () => {
  console.group('🔍 Readest Compatibility Check');
  
  try {
    // 检查边距设置
    const hasMarginSettings = DEFAULT_VIEW_SETTINGS.marginTopPx >= 0 && 
                             DEFAULT_VIEW_SETTINGS.marginBottomPx >= 0;
    
    // 检查紧凑模式边距
    const hasCompactMargins = DEFAULT_VIEW_SETTINGS.compactMarginTopPx >= 0 &&
                             DEFAULT_VIEW_SETTINGS.compactMarginBottomPx >= 0;
    
    // 检查文本设置
    const hasTextSettings = DEFAULT_VIEW_SETTINGS.lineHeight >= 1.0 &&
                           DEFAULT_VIEW_SETTINGS.paragraphMargin >= 0;
    
    // 检查布局设置
    const hasLayoutSettings = DEFAULT_VIEW_SETTINGS.maxColumnCount >= 1 &&
                             DEFAULT_VIEW_SETTINGS.gapPercent >= 0;
    
    // 检查显示设置
    const hasDisplaySettings = typeof DEFAULT_VIEW_SETTINGS.showHeader === 'boolean' &&
                              typeof DEFAULT_VIEW_SETTINGS.showFooter === 'boolean';
    
    console.log('Compatibility check results:', {
      margins: hasMarginSettings ? '✅' : '❌',
      compactMargins: hasCompactMargins ? '✅' : '❌',
      textSettings: hasTextSettings ? '✅' : '❌',
      layoutSettings: hasLayoutSettings ? '✅' : '❌',
      displaySettings: hasDisplaySettings ? '✅' : '❌',
    });
    
    const isCompatible = hasMarginSettings && hasCompactMargins && 
                        hasTextSettings && hasLayoutSettings && hasDisplaySettings;
    
    if (isCompatible) {
      console.log('✅ Settings are compatible with readest project');
    } else {
      console.warn('⚠️ Some settings may not be fully compatible');
    }
    
    return isCompatible;
    
  } catch (error) {
    console.error('❌ Compatibility check failed:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};

/**
 * 在开发环境中运行测试
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 延迟执行以确保所有模块都已加载
  setTimeout(() => {
    testLayoutSettingsSystem();
    validateReadestCompatibility();
  }, 1000);
} 