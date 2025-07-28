// 字体样式系统 - 完全基于readest项目实现

import { ViewSettings } from '@/types/book';

// 字体栈定义 - 与readest保持一致
const SERIF_FONTS = ['Bitter', 'Literata', 'Merriweather', 'Vollkorn', 'Times New Roman', 'Georgia'];
const SANS_SERIF_FONTS = ['Roboto', 'Noto Sans', 'Open Sans', 'Helvetica Neue', 'Arial'];
const MONOSPACE_FONTS = ['Fira Code', 'Consolas', 'Monaco', 'Courier New'];

// 🎯 CJK字体定义 - 包含所有CDN字体（包括分片字体）
const CJK_SERIF_FONTS = [
  'LXGW WenKai',        // ✅ 单文件字体 - 立即可用
  'Huiwen-mincho',      // 分片字体 - 渲染时可用
  'KingHwaOldSong',     // 分片字体 - 渲染时可用
  'Noto Serif CJK',     // 分片字体 - 渲染时可用
  'GuanKiapTsingKhai',  // ✅ 分片字体 - 渲染时可用
];

const CJK_SANS_SERIF_FONTS = [
  'LXGW WenKai',        // ✅ 单文件字体 - 立即可用
  'Huiwen-mincho',      // 分片字体 - 渲染时可用
  'KingHwaOldSong',     // 分片字体 - 渲染时可用
  'Noto Serif CJK',     // 分片字体 - 渲染时可用
  'GuanKiapTsingKhai',  // ✅ 分片字体 - 渲染时可用
];

const FALLBACK_FONTS = ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI'];

// 平台检测
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

/**
 * 🎯 完全复制readest的字体样式生成逻辑
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
  console.log('🎨 字体栈构建 (readest逻辑):', {
    defaultFont,
    defaultCJKFont,
    serif,
    sansSerif,
  });

  // 🔥 完全复制readest的字体栈构建逻辑
  const lastSerifFonts = ['Georgia', 'Times New Roman'];
  
  // 🎯 关键修改：只把当前选择的CJK字体放在最前面
  const serifFonts = defaultCJKFont && defaultCJKFont !== serif
    ? [
        defaultCJKFont,  // 🔥 只有当前选择的CJK字体放在最前面
        serif,
        ...SERIF_FONTS.filter(
          (font) => font !== serif && font !== defaultCJKFont && !lastSerifFonts.includes(font),
        ),
        ...CJK_SERIF_FONTS.filter((font) => font !== serif && font !== defaultCJKFont),
        ...lastSerifFonts.filter(
          (font) => SERIF_FONTS.includes(font) && !lastSerifFonts.includes(defaultCJKFont),
        ),
        ...FALLBACK_FONTS,
      ]
    : [
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

  const sansSerifFonts = defaultCJKFont && defaultCJKFont !== sansSerif
    ? [
        defaultCJKFont,  // 🔥 只有当前选择的CJK字体放在最前面
        sansSerif,
        ...SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
        ...CJK_SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
        ...FALLBACK_FONTS,
      ]
    : [
        sansSerif,
        ...SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
        ...(defaultCJKFont !== sansSerif ? [defaultCJKFont] : []),
        ...CJK_SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
        ...FALLBACK_FONTS,
      ];

  const monospaceFonts = [
    monospace,
    ...MONOSPACE_FONTS.filter((font) => font !== monospace),
    ...FALLBACK_FONTS,
  ];

  console.log('🎨 字体栈结果 (只有选中CJK字体优先):', {
    serifFonts: serifFonts.slice(0, 5),
    sansSerifFonts: sansSerifFonts.slice(0, 5),
    defaultCJKFont,
  });

  const fontStyles = `
    html {
      --serif: ${serifFonts.map((font) => `"${font}"`).join(', ')}, serif;
      --sans-serif: ${sansSerifFonts.map((font) => `"${font}"`).join(', ')}, sans-serif;
      --monospace: ${monospaceFonts.map((font) => `"${font}"`).join(', ')}, monospace;
    }
    html, body {
      font-family: var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) ${overrideFont ? '!important' : ''};
      font-size: ${fontSize}px !important;
      font-weight: ${fontWeight};
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    }
    font[size="1"] {
      font-size: ${minFontSize}px;
    }
    font[size="2"] {
      font-size: ${minFontSize * 1.5}px;
    }
    font[size="3"] {
      font-size: ${fontSize}px;
    }
    font[size="4"] {
      font-size: ${fontSize * 1.2}px;
    }
    font[size="5"] {
      font-size: ${fontSize * 1.5}px;
    }
    font[size="6"] {
      font-size: ${fontSize * 2}px;
    }
    font[size="7"] {
      font-size: ${fontSize * 3}px;
    }
    /* hardcoded inline font size */
    [style*="font-size: 16px"], [style*="font-size:16px"] {
      font-size: 1rem !important;
    }
    body * {
      ${overrideFont ? 'font-family: revert !important;' : ''}
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

/**
 * 🎯 生成主页面字体样式 - 使用readest的字体栈逻辑
 */
export const getMainPageFontStyles = (viewSettings: ViewSettings): string => {
  const {
    serifFont = 'Bitter',
    sansSerifFont = 'Roboto', 
    monospaceFont = 'Consolas',
    defaultFont = 'Serif',
    defaultCJKFont = 'LXGW WenKai',
    overrideFont = false
  } = viewSettings;

  // 🔥 使用与getFontStyles完全相同的字体栈构建逻辑
  const lastSerifFonts = ['Georgia', 'Times New Roman'];
  const serifFonts = [
    serifFont,
    ...SERIF_FONTS.filter(
      (font) => font !== serifFont && font !== defaultCJKFont && !lastSerifFonts.includes(font),
    ),
    ...(defaultCJKFont !== serifFont ? [defaultCJKFont] : []),
    ...CJK_SERIF_FONTS.filter((font) => font !== serifFont && font !== defaultCJKFont),
    ...lastSerifFonts.filter(
      (font) => SERIF_FONTS.includes(font) && !lastSerifFonts.includes(defaultCJKFont),
    ),
    ...FALLBACK_FONTS,
  ];
  
  const sansSerifFonts = [
    sansSerifFont,
    ...SANS_SERIF_FONTS.filter((font) => font !== sansSerifFont && font !== defaultCJKFont),
    ...(defaultCJKFont !== sansSerifFont ? [defaultCJKFont] : []),
    ...CJK_SANS_SERIF_FONTS.filter((font) => font !== sansSerifFont && font !== defaultCJKFont),
    ...FALLBACK_FONTS,
  ];

  const monospaceFonts = [monospaceFont, ...MONOSPACE_FONTS.filter((font) => font !== monospaceFont)];

  // 生成主页面CSS变量
  const mainFontFamily = defaultFont.toLowerCase() === 'serif' 
    ? serifFonts.map(font => `"${font}"`).join(', ') + ', serif'
    : sansSerifFonts.map(font => `"${font}"`).join(', ') + ', sans-serif';

  return `
    :root {
      --main-serif: ${serifFonts.map((font) => `"${font}"`).join(', ')}, serif;
      --main-sans-serif: ${sansSerifFonts.map((font) => `"${font}"`).join(', ')}, sans-serif;
      --main-monospace: ${monospaceFonts.map((font) => `"${font}"`).join(', ')}, monospace;
      --main-font-family: ${mainFontFamily};
    }
    
    /* 应用统一字体到主页面元素 */
    body, html {
      font-family: var(--main-font-family) ${overrideFont ? '!important' : ''};
    }
    
    /* 侧边栏和导航元素 */
    aside, nav, .sidebar, [class*="sidebar"], .toc, [class*="toc"] {
      font-family: var(--main-font-family) ${overrideFont ? '!important' : ''};
    }
    
    /* 所有文本元素 */
    p, div, span, h1, h2, h3, h4, h5, h6, li, td, th {
      font-family: inherit ${overrideFont ? '!important' : ''};
    }
    
    /* 特别针对中文内容 */
    [lang*="zh"], [lang*="ja"], [lang*="ko"], .cjk {
      font-family: "${defaultCJKFont}", var(--main-font-family) ${overrideFont ? '!important' : ''};
    }
  `;
};

// 移除字体样式
export const removeFontStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleElement = document.getElementById('font-styles');
  if (styleElement) {
    styleElement.remove();
  }
}; 