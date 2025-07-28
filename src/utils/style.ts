import { ViewSettings } from '@/types/book';
import { getFontStyles } from '@/utils/fontStyles';

// 主题代码类型
export interface ThemeCode {
  bg: string;
  fg: string;
  primary: string;
  isDarkMode: boolean;
}

// 获取主题代码
export const getThemeCode = (theme: string = 'light'): ThemeCode => {
  switch (theme) {
    case 'dark':
      return {
        bg: '#1a1a1a',
        fg: '#e4e4e7',
        primary: '#60a5fa',
        isDarkMode: true,
      };
    case 'sepia':
      return {
        bg: '#f7f3e3',
        fg: '#5c4b37',
        primary: '#8b5a2b',
        isDarkMode: false,
      };
    case 'solarized-light':
      return {
        bg: '#fdf6e3',
        fg: '#657b83',
        primary: '#268bd2',
        isDarkMode: false,
      };
    case 'solarized-dark':
      return {
        bg: '#002b36',
        fg: '#839496',
        primary: '#268bd2',
        isDarkMode: true,
      };
    case 'gruvbox-light':
      return {
        bg: '#fbf1c7',
        fg: '#3c3836',
        primary: '#af3a03',
        isDarkMode: false,
      };
    case 'gruvbox-dark':
      return {
        bg: '#282828',
        fg: '#ebdbb2',
        primary: '#fabd2f',
        isDarkMode: true,
      };
    default: // light
      return {
        bg: '#ffffff',
        fg: '#1f2937',
        primary: '#3b82f6',
        isDarkMode: false,
      };
  }
};

/**
 * 生成阅读器的CSS样式
 * 参考readest的样式生成逻辑
 */
export const getStyles = (viewSettings: ViewSettings): string => {
  const {
    theme = 'light',
    defaultFontSize = 16,
    lineHeight = 1.6,
    marginTopPx = 48,
    marginBottomPx = 48,
    marginLeftPx = 48,
    marginRightPx = 48,
    overrideColor = false,
    invertImgColorInDark = false,
  } = viewSettings;

  // 基础样式
  let styles = `
    :root {
      --font-size: ${defaultFontSize}px;
      --line-height: ${lineHeight};
      --margin-top: ${marginTopPx}px;
      --margin-bottom: ${marginBottomPx}px;
      --margin-left: ${marginLeftPx}px;
      --margin-right: ${marginRightPx}px;
    }

    body {
      font-size: var(--font-size) !important;
      line-height: var(--line-height) !important;
      margin: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left) !important;
    }

    p, div, span {
      line-height: var(--line-height) !important;
    }
  `;

  // 主题样式
  if (theme === 'dark') {
    styles += `
      :root {
        --bg-color: #1a1a1a;
        --text-color: #e0e0e0;
        --link-color: #61a5ff;
      }
      
      body {
        background-color: var(--bg-color) !important;
        color: var(--text-color) !important;
      }
      
      a {
        color: var(--link-color) !important;
      }
    `;

    // 深色模式下反转图片颜色
    if (invertImgColorInDark) {
      styles += `
        img {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `;
    }
  } else if (theme === 'sepia') {
    styles += `
      :root {
        --bg-color: #f4f1ea;
        --text-color: #5c4b37;
        --link-color: #8b4513;
      }
      
      body {
        background-color: var(--bg-color) !important;
        color: var(--text-color) !important;
      }
      
      a {
        color: var(--link-color) !important;
      }
    `;
  } else {
    // 默认浅色主题
    styles += `
      :root {
        --bg-color: #ffffff;
        --text-color: #000000;
        --link-color: #0066cc;
      }
      
      body {
        background-color: var(--bg-color) !important;
        color: var(--text-color) !important;
      }
      
      a {
        color: var(--link-color) !important;
      }
    `;
  }

  // 如果启用了颜色覆盖
  if (overrideColor) {
    styles += `
      * {
        background-color: var(--bg-color) !important;
        color: var(--text-color) !important;
      }
    `;
  }

  // 添加字体样式
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
  
  styles += '\n' + fontStyles;

  return styles.trim();
};

/**
 * 获取布局样式 - 与readest项目一致
 */
export const getLayoutStyles = (
  overrideLayout: boolean,
  paragraphMargin: number,
  lineSpacing: number,
  wordSpacing: number,
  letterSpacing: number,
  textIndent: number,
  justify: boolean,
  hyphenate: boolean,
  zoomLevel: number,
  writingMode: string,
  vertical: boolean,
) => {
  const layoutStyle = `
  @namespace epub "http://www.idpf.org/2007/ops";
  html {
    --default-text-align: ${justify ? 'justify' : 'start'};
    hanging-punctuation: allow-end last;
    orphans: 2;
    widows: 2;
  }
  [align="left"] { text-align: left; }
  [align="right"] { text-align: right; }
  [align="center"] { text-align: center; }
  [align="justify"] { text-align: justify; }
  :is(hgroup, header) p {
      text-align: unset;
      hyphens: unset;
  }
  pre {
      white-space: pre-wrap !important;
      tab-size: 2;
  }
  html, body {
    ${writingMode === 'auto' ? '' : `writing-mode: ${writingMode} !important;`}
    text-align: var(--default-text-align);
    max-height: unset;
  }
  body {
    overflow: unset;
    zoom: ${zoomLevel};
  }
  svg, img {
    height: auto;
    width: auto;
    background-color: transparent !important;
  }
  /* enlarge the clickable area of links */
  a {
    position: relative !important;
  }
  a::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
  }
  p, blockquote, dd, div:not(:has(*:not(b, a, em, i, strong, u, span))) {
    line-height: ${lineSpacing} ${overrideLayout ? '!important' : ''};
    word-spacing: ${wordSpacing}px ${overrideLayout ? '!important' : ''};
    letter-spacing: ${letterSpacing}px ${overrideLayout ? '!important' : ''};
    text-indent: ${vertical ? textIndent * 1.2 : textIndent}em ${overrideLayout ? '!important' : ''};
    ${justify ? `text-align: justify ${overrideLayout ? '!important' : ''};` : ''}
    ${!justify && overrideLayout ? 'text-align: unset !important;' : ''};
    -webkit-hyphens: ${hyphenate ? 'auto' : 'manual'};
    hyphens: ${hyphenate ? 'auto' : 'manual'};
    -webkit-hyphenate-limit-before: 3;
    -webkit-hyphenate-limit-after: 2;
    -webkit-hyphenate-limit-lines: 2;
    hanging-punctuation: allow-end last;
    widows: 2;
    orphans: 2;
  }
  /* add space between multiple paragraphs in the same element */
  :is(div, td, th, section) > :is(p, div):not(:last-child) {
    ${overrideLayout ? `margin-bottom: ${paragraphMargin}em !important;` : `margin-bottom: ${paragraphMargin}em;`}
  }
  /* clear margin in forced line breaks */
  :is(div, td, th, section) > :is(p, div):last-child {
    ${overrideLayout ? 'margin-bottom: 0 !important;' : 'margin-bottom: 0;'}
  }
  `;

  return layoutStyle.trim();
};

/**
 * 获取颜色样式 - 与readest项目一致
 */
export const getColorStyles = (
  theme: string,
  overrideColor: boolean,
  invertImgColorInDark: boolean,
) => {
  const themeCode = getThemeCode(theme);
  const { bg, fg, primary, isDarkMode } = themeCode;
  
  const colorStyles = `
    html {
      --theme-bg-color: ${bg};
      --theme-fg-color: ${fg};
      --theme-primary-color: ${primary};
      color-scheme: ${isDarkMode ? 'dark' : 'light'};
    }
    html, body {
      color: ${fg};
    }
    html[has-background], body[has-background] {
      --background-set: var(--theme-bg-color);
    }
    html {
      background-color: var(--theme-bg-color, transparent);
      background: var(--background-set, none);
    }
    div, p, h1, h2, h3, h4, h5, h6 {
      ${overrideColor ? `background-color: ${bg} !important;` : ''}
      ${overrideColor ? `color: ${fg} !important;` : ''}
    }
    pre, span { /* inline code blocks */
      ${overrideColor ? `background-color: ${bg} !important;` : ''}
    }
    a:any-link {
      ${overrideColor ? `color: ${primary};` : isDarkMode ? `color: lightblue;` : ''}
      text-decoration: none;
    }
    p:has(img), span:has(img) {
      background-color: ${bg};
    }
    body.pbg {
      ${isDarkMode ? `background-color: ${bg} !important;` : ''}
    }
    img {
      ${isDarkMode && invertImgColorInDark ? 'filter: invert(100%);' : ''}
      ${!isDarkMode && overrideColor ? 'mix-blend-mode: multiply;' : ''}
    }
    /* inline images */
    p img, span img, sup img {
      mix-blend-mode: ${isDarkMode ? 'screen' : 'multiply'};
    }
    /* override inline hardcoded text color */
    *[style*="color: rgb(0,0,0)"], *[style*="color: rgb(0, 0, 0)"],
    *[style*="color: #000"], *[style*="color: #000000"], *[style*="color: black"],
    *[style*="color:rgb(0,0,0)"], *[style*="color:rgb(0, 0, 0)"],
    *[style*="color:#000"], *[style*="color:#000000"], *[style*="color:black"] {
      color: ${fg} !important;
    }
    /* for the Gutenberg eBooks */
    #pg-header * {
      color: inherit !important;
    }
    .x-ebookmaker, .x-ebookmaker-cover, .x-ebookmaker-coverpage {
      background-color: unset !important;
    }
    /* for the Feedbooks eBooks */
    .chapterHeader, .chapterHeader * {
      border-color: unset;
      background-color: ${bg} !important;
    }
  `;
  return colorStyles;
};

/**
 * 获取完整的样式 - 与readest项目一致
 */
export const getCompleteStyles = (viewSettings: ViewSettings) => {
  const layoutStyles = getLayoutStyles(
    viewSettings.overrideLayout || false,
    viewSettings.paragraphMargin || 0.5,
    viewSettings.lineHeight || 1.6,
    viewSettings.wordSpacing || 0,
    viewSettings.letterSpacing || 0,
    viewSettings.textIndent || 1,
    viewSettings.fullJustification || false,
    viewSettings.hyphenation || false,
    (viewSettings.zoomLevel || 100) / 100.0,
    viewSettings.writingMode || 'auto',
    viewSettings.vertical || false,
  );
  
  const fontStyles = getFontStyles(
    viewSettings.serifFont || 'Bitter',
    viewSettings.sansSerifFont || 'Roboto',
    viewSettings.monospaceFont || 'Consolas',
    viewSettings.defaultFont || 'Serif',
    viewSettings.defaultCJKFont || 'LXGW WenKai',
    viewSettings.defaultFontSize || 16,
    viewSettings.minimumFontSize || 8,
    viewSettings.fontWeight || 400,
    viewSettings.overrideFont || false
  );
  const colorStyles = getColorStyles(viewSettings.theme || 'light', viewSettings.overrideColor || false, viewSettings.invertImgColorInDark || false);
  const translationStyles = getTranslationStyles(viewSettings.showTranslateSource || false);
  const userStylesheet = viewSettings.userStylesheet || '';
  
  console.log('🎨 生成完整样式 (包含新字体):', {
    defaultCJKFont: viewSettings.defaultCJKFont,
    fontStylesLength: fontStyles.length,
    包含新字体: fontStyles.includes(viewSettings.defaultCJKFont || '')
  });
  
  return `${layoutStyles}\n${fontStyles}\n${colorStyles}\n${translationStyles}\n${userStylesheet}`;
};

/**
 * 获取翻译样式
 */
export const getTranslationStyles = (showTranslateSource: boolean) => {
  return `
    .translation-highlight {
      background-color: rgba(255, 255, 0, 0.3);
      padding: 2px 4px;
      border-radius: 2px;
      ${showTranslateSource ? '' : 'opacity: 0.7;'}
    }
    .translation-popup {
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
    }
  `;
};

/**
 * 应用固定布局样式（用于PDF等）
 */
export const applyFixedlayoutStyles = (doc: Document, viewSettings: ViewSettings) => {
  const style = doc.createElement('style');
  style.textContent = getCompleteStyles(viewSettings);
  doc.head.appendChild(style);
};

/**
 * 应用图片样式
 */
export const applyImageStyle = (viewSettings: ViewSettings) => {
  const { invertImgColorInDark, theme } = viewSettings;
  
  if (theme === 'dark' && invertImgColorInDark) {
    return `
      img {
        filter: invert(1) hue-rotate(180deg);
      }
    `;
  }
  
  return '';
};

/**
 * 应用翻译样式（简化实现）
 */
export const applyTranslationStyle = (viewSettings: ViewSettings) => {
  // 翻译相关的样式
  return `
    .translation-highlight {
      background-color: rgba(255, 255, 0, 0.3);
      padding: 2px 4px;
      border-radius: 2px;
    }
  `;
};

/**
 * 转换样式表（简化实现）
 */
export const transformStylesheet = (css: string, viewSettings: ViewSettings): string => {
  // 这里可以根据viewSettings对CSS进行转换
  // 例如调整字体大小、颜色等
  let transformedCss = css;
  
  // 替换字体大小
  transformedCss = transformedCss.replace(
    /font-size:\s*[\d.]+px/gi,
    `font-size: ${viewSettings.defaultFontSize}px`
  );
  
  // 替换行高
  transformedCss = transformedCss.replace(
    /line-height:\s*[\d.]+/gi,
    `line-height: ${viewSettings.lineHeight}`
  );
  
  return transformedCss;
}; 