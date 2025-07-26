import { ViewSettings } from '@/types/book';
import { getFontStyles } from '@/utils/fontStyles';

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
 * 应用固定布局样式（用于PDF等）
 */
export const applyFixedlayoutStyles = (doc: Document, viewSettings: ViewSettings) => {
  const style = doc.createElement('style');
  style.textContent = getStyles(viewSettings);
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