// 字体样式系统 - 基于readest项目设计

import { ViewSettings } from '@/types/book';

// 字体常量定义（与readest一致）
const SERIF_FONTS = [
  'Bitter',
  'Literata', 
  'Merriweather',
  'Vollkorn',
  'Georgia',
  'Times New Roman',
];

const SANS_SERIF_FONTS = [
  'Roboto',
  'Noto Sans',
  'Open Sans', 
  'Helvetica'
];

const MONOSPACE_FONTS = [
  'Fira Code',
  'Lucida Console', 
  'Consolas',
  'Courier New'
];

const CJK_SERIF_FONTS = [
  'LXGW WenKai GB Screen',
  'LXGW WenKai TC',
  'GuanKiapTsingKhai-T',
  'Source Han Serif CN VF',
  'Huiwen-mincho',
  'KingHwa_OldSong',
];

const CJK_SANS_SERIF_FONTS = [
  'Noto Sans SC',
  'Noto Sans TC'
];

const FALLBACK_FONTS = ['MiSans L3'];

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

// 字体样式生成函数（与readest完全一致）
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
) => {
  const lastSerifFonts = ['Georgia', 'Times New Roman'];
  
  // 构建衬线字体栈
  const serifFonts = [
    serif,
    ...SERIF_FONTS.filter(
      (font) => font !== serif && font !== defaultCJKFont && !lastSerifFonts.includes(font),
    ),
    ...(defaultCJKFont !== serif ? [defaultCJKFont] : []),
    ...CJK_SERIF_FONTS.filter((font) => font !== serif && font !== defaultCJKFont),
    ...lastSerifFonts.filter(
      (font) => SERIF_FONTS.includes(font) && !lastSerifFonts.includes(defaultCJKFont),
    ),
    ...FALLBACK_FONTS,
  ];
  
  // 构建无衬线字体栈
  const sansSerifFonts = [
    sansSerif,
    ...SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
    ...(defaultCJKFont !== sansSerif ? [defaultCJKFont] : []),
    ...CJK_SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
    ...FALLBACK_FONTS,
  ];
  
  // 构建等宽字体栈
  const monospaceFonts = [monospace, ...MONOSPACE_FONTS.filter((font) => font !== monospace)];
  
  // 移动端字体缩放（与readest一致）
  const fontScale = isMobile() ? 1.25 : 1;
  const scaledFontSize = fontSize * fontScale;
  
  // 生成CSS样式（与readest格式完全一致）
  const fontStyles = `
    html {
      --serif: ${serifFonts.map((font) => `"${font}"`).join(', ')}, serif;
      --sans-serif: ${sansSerifFonts.map((font) => `"${font}"`).join(', ')}, sans-serif;
      --monospace: ${monospaceFonts.map((font) => `"${font}"`).join(', ')}, monospace;
    }
    html, body {
      font-family: var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) ${overrideFont ? '!important' : ''};
      font-size: ${scaledFontSize}px !important;
      font-weight: ${fontWeight};
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    }
    code, pre, .code, tt, kbd, samp {
      font-family: var(--monospace) !important;
    }
    [lang="zh"], [lang="zh-CN"], [lang="zh-TW"] {
      font-family: "${defaultCJKFont}", var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) ${overrideFont ? '!important' : ''};
    }
    /* 确保阅读器内容使用正确的字体 */
    .content, .chapter, .book-content, article, section {
      font-family: var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) ${overrideFont ? '!important' : ''};
    }
    /* 中文字符强制使用CJK字体 */
    .cjk, [data-lang*="zh"], [data-lang*="ja"], [data-lang*="ko"] {
      font-family: "${defaultCJKFont}", var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) !important;
    }
    font[size="1"] {
      font-size: ${minFontSize}px;
    }
    font[size="2"] {
      font-size: ${minFontSize * 1.5}px;
    }
    font[size="3"] {
      font-size: ${scaledFontSize}px;
    }
    font[size="4"] {
      font-size: ${scaledFontSize * 1.2}px;
    }
    font[size="5"] {
      font-size: ${scaledFontSize * 1.5}px;
    }
    font[size="6"] {
      font-size: ${scaledFontSize * 2}px;
    }
    font[size="7"] {
      font-size: ${scaledFontSize * 3}px;
    }
    /* hardcoded inline font size */
    [style*="font-size: 16px"], [style*="font-size:16px"] {
      font-size: 1rem !important;
    }
    ${overrideFont ? `
    /* 强制覆盖所有字体 */
    * {
      font-family: var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) !important;
    }
    code, pre, .code, tt, kbd, samp {
      font-family: var(--monospace) !important;
    }
    [lang="zh"], [lang="zh-CN"], [lang="zh-TW"], .cjk {
      font-family: "${defaultCJKFont}", var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) !important;
    }
    ` : ''}
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