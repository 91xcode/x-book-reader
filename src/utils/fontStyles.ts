// 字体样式系统 - 基于readest项目设计

import { ViewSettings } from '@/types/book';

// 常量定义 - 使用本地字体
const SERIF_FONTS = [
  'Bitter',
  'Times New Roman',
  'Georgia',
  'serif'
];

const SANS_SERIF_FONTS = [
  'Roboto',
  'Arial',
  'Helvetica',
  'sans-serif'
];

const MONOSPACE_FONTS = [
  'Fira Code',
  'Consolas',
  'Monaco',
  'Courier New',
  'monospace'
];

const CJK_SERIF_FONTS = [
  'LXGW WenKai',
  'SimSun',
  'Microsoft YaHei',
  'PingFang SC',
  'Source Han Serif SC',
  'Noto Serif CJK SC'
];

const CJK_SANS_SERIF_FONTS = [
  'LXGW WenKai',
  'Microsoft YaHei',
  'PingFang SC',
  'SimHei',
  'Source Han Sans SC',
  'Noto Sans CJK SC'
];

const FALLBACK_FONTS = ['serif', 'sans-serif'];

// 平台检测（简化版）
const getOSPlatform = () => {
  if (typeof window === 'undefined') return 'unknown';
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
  return 'unknown';
};

const isMobile = () => {
  const platform = getOSPlatform();
  return ['ios', 'android'].includes(platform);
};

/**
 * 生成字体样式CSS - 采用readest的字体处理策略
 */
export const getFontStyles = (
  serif: string,
  sansSerif: string,
  monospace: string,
  defaultFont: string,
  defaultCJKFont: string,
  fontSize: number,
  minFontSize: number,
  fontWeight: number,
  overrideFont: boolean,
): string => {
  // 构建字体数组
  const serifFonts = [serif, ...SERIF_FONTS.filter(f => f !== serif)];
  const sansSerifFonts = [sansSerif, ...SANS_SERIF_FONTS.filter(f => f !== sansSerif)];
  const monospaceFonts = [monospace, ...MONOSPACE_FONTS.filter(f => f !== monospace)];
  
  // 移动端字体缩放
  const fontScale = isMobile() ? 1.25 : 1;
  const scaledFontSize = fontSize * fontScale;
  
  // 组合字体栈 - 参考readest的策略
  const lastSerifFonts = ['Georgia', 'Times New Roman'];
  const finalSerifFonts = [
    serif,
    ...SERIF_FONTS.filter(f => f !== serif && f !== defaultCJKFont && !lastSerifFonts.includes(f)),
    ...(defaultCJKFont !== serif ? [defaultCJKFont] : []),
    ...CJK_SERIF_FONTS.filter(f => f !== serif && f !== defaultCJKFont),
    ...lastSerifFonts.filter(f => SERIF_FONTS.includes(f) && !lastSerifFonts.includes(defaultCJKFont)),
    ...FALLBACK_FONTS,
  ];
  
  const finalSansSerifFonts = [
    sansSerif,
    ...SANS_SERIF_FONTS.filter(f => f !== sansSerif && f !== defaultCJKFont),
    ...(defaultCJKFont !== sansSerif ? [defaultCJKFont] : []),
    ...CJK_SANS_SERIF_FONTS.filter(f => f !== sansSerif && f !== defaultCJKFont),
    ...FALLBACK_FONTS,
  ];
  
  console.log('🎨 字体切换 (readest策略):', {
    defaultFont,
    defaultCJKFont,
    scaledFontSize,
    overrideFont
  });
  
  // 采用readest的字体样式策略
  const fontStyles = `
    html {
      --serif: ${finalSerifFonts.map(f => `"${f}"`).join(', ')}, serif;
      --sans-serif: ${finalSansSerifFonts.map(f => `"${f}"`).join(', ')}, sans-serif;
      --monospace: ${monospaceFonts.map(f => `"${f}"`).join(', ')}, monospace;
    }
    
    /* 基础字体设置 - 关键：字体大小总是强制设置 */
    html, body {
      font-family: var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) ${overrideFont ? '!important' : ''};
      font-size: ${scaledFontSize}px !important;
      font-weight: ${fontWeight};
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    }
    
    /* 🔥 增强优先级：强制字体大小应用到所有元素 */
    html *, body *, p, div, span, h1, h2, h3, h4, h5, h6, article, section, main, li, td, th {
      font-size: inherit !important;
    }
    
    /* 🔥 特定字体大小覆盖 */
    p, div:not([class*="icon"]):not([class*="svg"]), span:not([class*="icon"]) {
      font-size: ${scaledFontSize}px !important;
      line-height: inherit !important;
    }
    
    /* 标题相对大小 */
    h1 { font-size: ${scaledFontSize * 2}px !important; }
    h2 { font-size: ${scaledFontSize * 1.5}px !important; }
    h3 { font-size: ${scaledFontSize * 1.3}px !important; }
    h4 { font-size: ${scaledFontSize * 1.1}px !important; }
    h5 { font-size: ${scaledFontSize}px !important; }
    h6 { font-size: ${scaledFontSize * 0.9}px !important; }
    
    /* 字体大小规则 */
    font[size="1"] { font-size: ${minFontSize}px !important; }
    font[size="2"] { font-size: ${minFontSize * 1.5}px !important; }
    font[size="3"] { font-size: ${scaledFontSize}px !important; }
    font[size="4"] { font-size: ${scaledFontSize * 1.2}px !important; }
    font[size="5"] { font-size: ${scaledFontSize * 1.5}px !important; }
    font[size="6"] { font-size: ${scaledFontSize * 2}px !important; }
    font[size="7"] { font-size: ${scaledFontSize * 3}px !important; }
    
    /* 覆盖常见的内联样式 */
    [style*="font-size: 16px"], [style*="font-size:16px"],
    [style*="font-size: 14px"], [style*="font-size:14px"],
    [style*="font-size: 12px"], [style*="font-size:12px"],
    [style*="font-size: 18px"], [style*="font-size:18px"] {
      font-size: ${scaledFontSize}px !important;
    }
    
    /* readest策略：子元素字体继承 */
    body * {
      ${overrideFont ? 'font-family: revert !important;' : ''}
    }
    
    /* 等宽字体 */
    code, pre, .code, tt, kbd, samp {
      font-family: var(--monospace) !important;
    }
  `;
  return fontStyles;
};

// 应用字体样式
export const applyFontStyles = (viewSettings: ViewSettings) => {
  if (typeof document === 'undefined') return;
  
  const styleId = 'font-styles';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const fontStyles = getFontStyles(
    viewSettings.serifFont || 'Bitter',
    viewSettings.sansSerifFont || 'Roboto',
    viewSettings.monospaceFont || 'Consolas',
    viewSettings.defaultFont || 'Serif',
    viewSettings.defaultCJKFont || 'LXGW WenKai',
    viewSettings.defaultFontSize || 16,
    viewSettings.minimumFontSize || 8,
    viewSettings.fontWeight || 400,
    viewSettings.overrideFont || false,
  );

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = fontStyles;
  document.head.appendChild(styleElement);
};

// 移除字体样式
export const removeFontStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleElement = document.getElementById('font-styles');
  if (styleElement) {
    styleElement.remove();
  }
}; 