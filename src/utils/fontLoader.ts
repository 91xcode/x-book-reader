// 字体 CDN 加载器 - 基于 readest 项目的字体加载机制

import { detectCJKEnvironment } from './misc';

// 基础 Google Fonts 字体配置（来自 readest）
const basicGoogleFonts = [
  { family: 'Bitter', weights: 'ital,wght@0,100..900;1,100..900' },
  { family: 'Fira Code', weights: 'wght@300..700' },
  { family: 'Literata', weights: 'ital,opsz,wght@0,7..72,200..900;1,7..72,200..900' },
  { family: 'Merriweather', weights: 'ital,opsz,wght@0,18..144,300..900;1,18..144,300..900' },
  { family: 'Noto Sans', weights: 'ital,wght@0,100..900;1,100..900' },
  { family: 'Open Sans', weights: 'ital,wght@0,300..800;1,300..800' },
  { family: 'Roboto', weights: 'ital,wght@0,100..900;1,100..900' },
  { family: 'Vollkorn', weights: 'ital,wght@0,400..900;1,400..900' },
];

// CJK Google Fonts 字体配置（来自 readest）
const cjkGoogleFonts = [
  { family: 'LXGW WenKai TC', weights: '' },
  { family: 'Noto Sans SC', weights: '' },
  { family: 'Noto Sans TC', weights: '' },
  { family: 'Noto Serif JP', weights: '' },
];

// 生成基础字体的 CDN 链接
const getBasicFontLinks = () => `
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${basicGoogleFonts
    .map(
      ({ family, weights }) =>
        `family=${encodeURIComponent(family)}${weights ? `:${weights}` : ''}`,
    )
    .join('&')}&display=swap" crossorigin="anonymous">
`;

// 生成 CJK 字体的 CDN 链接（完全按照 readest 的配置）
const getCJKFontLinks = () => `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/misans-webfont@1.0.4/misans-l3/misans-l3/result.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6/font.min.css" crossorigin="anonymous" />
  <link rel='stylesheet' href='https://ik.imagekit.io/fonts18/packages/hwmct/dist/%E6%B1%87%E6%96%87%E6%98%8E%E6%9C%9D%E4%BD%93/result.css' crossorigin="anonymous" />
  <link rel='stylesheet' href='https://ik.imagekit.io/fonts18/packages/jhlst/dist/%E4%BA%AC%E8%8F%AF%E8%80%81%E5%AE%8B%E4%BD%93v2_002/result.css' crossorigin="anonymous" />
  <link rel='stylesheet' href='https://ik.imagekit.io/fonts18/packages/syst/dist/SourceHanSerifCN/result.css' crossorigin="anonymous" />
  <link rel='stylesheet' href='https://ik.imagekit.io/fonts18/packages/GuanKiapTsingKhai/dist/GuanKiapTsingKhai-T/result.css' crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${cjkGoogleFonts
    .map(
      ({ family, weights }) =>
        `family=${encodeURIComponent(family)}${weights ? `:${weights}` : ''}`,
    )
    .join('&')}&display=swap" crossorigin="anonymous" />
`;

// 生成 CJK 字体的自定义 @font-face 规则（来自 readest）
const getCJKFontFaces = () => `
  @font-face {
    font-family: "FangSong";
    font-display: swap;
    src: local("Fang Song"), local("FangSong"), local("Noto Serif CJK"), local("Source Han Serif SC VF"), url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.eot");
    src: url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.eot?#iefix") format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.woff2") format("woff2"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.woff") format("woff"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.ttf") format("truetype"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.svg#FangSong") format("svg");
  }
  @font-face {
    font-family: "Kaiti";
    font-display: swap;
    src: local("Kai"), local("KaiTi"), local("AR PL UKai"), local("LXGW WenKai GB Screen"), url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.eot");
    src: url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.eot?#iefix")format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.woff2")format("woff2"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.woff")format("woff"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.svg#STKaiti")format("svg");
  }
  @font-face {
    font-family: "Heiti";
    font-display: swap;
    src: local("Hei"), local("SimHei"), local("WenQuanYi Zen Hei"), local("Source Han Sans SC VF"), url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.eot");
    src: url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.eot?#iefix")format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.woff2")format("woff2"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.woff")format("woff"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.svg#WenQuanYi Micro Hei")format("svg");
  }
  @font-face {
    font-family: "XiHeiti";
    font-display: swap;
    src: local("PingFang SC"), local("Microsoft YaHei"), local("WenQuanYi Micro Hei"), local("FZHei-B01"), url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.eot");
    src: url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.eot?#iefix")format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.woff2")format("woff2"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.woff")format("woff"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.svg#STHeiti J Light")format("svg");
}
`;

// CDN 字体加载器（与 readest 的 mountAdditionalFonts 函数完全一致）
export const loadCDNFonts = (document: Document, forceCJK = false) => {
  const shouldLoadCJK = forceCJK || detectCJKEnvironment();
  let links = getBasicFontLinks();
  
  if (shouldLoadCJK) {
    // 添加 CJK 字体的 @font-face 规则
    const style = document.createElement('style');
    style.textContent = getCJKFontFaces();
    style.id = 'cjk-font-faces';
    document.head.appendChild(style);

    // 添加 CJK 字体的 CDN 链接
    links = `${links}\n${getCJKFontLinks()}`;
  }

  // 解析并添加字体链接
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(links, 'text/html');

  Array.from(parsedDocument.head.children).forEach((child) => {
    if (child.tagName === 'LINK') {
      const link = document.createElement('link');
      link.rel = child.getAttribute('rel') || '';
      link.href = child.getAttribute('href') || '';
      link.crossOrigin = child.getAttribute('crossorigin') || '';
      
      // 添加标识符以便后续管理
      link.dataset.fontLoader = 'cdn';

      document.head.appendChild(link);
    }
  });
  
  console.log(`🎨 CDN 字体加载完成 - 基础字体 + ${shouldLoadCJK ? 'CJK字体' : '无CJK字体'}`);
};

// 移除 CDN 字体
export const removeCDNFonts = (document: Document) => {
  // 移除通过 CDN 加载的字体链接
  const cdnLinks = document.querySelectorAll('link[data-font-loader="cdn"]');
  cdnLinks.forEach(link => link.remove());
  
  // 移除 CJK 字体样式
  const cjkStyle = document.getElementById('cjk-font-faces');
  if (cjkStyle) {
    cjkStyle.remove();
  }
  
  console.log('🧹 CDN 字体已移除');
};

// 字体加载策略选项
export type FontLoadStrategy = 'local-only' | 'cdn-only' | 'local-first' | 'cdn-first';

// 智能字体加载器
export const loadFontsWithStrategy = (
  document: Document, 
  strategy: FontLoadStrategy = 'local-first',
  forceCJK = false
) => {
  console.log(`🚀 启动字体加载策略: ${strategy}`);
  
  switch (strategy) {
    case 'local-only':
      console.log('📁 仅使用本地字体，无需额外加载');
      break;
      
    case 'cdn-only':
      loadCDNFonts(document, forceCJK);
      break;
      
    case 'local-first':
    case 'cdn-first':
      // 两种策略的实现相同：先加载 CDN 字体作为补充
      // 本地字体通过 CSS 已经配置，CDN 字体作为回退
      loadCDNFonts(document, forceCJK);
      break;
  }
};

// 检查特定 CDN 字体是否已加载
export const isCDNFontLoaded = (fontFamily: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!document.fonts) {
      // 不支持 Font Loading API，假设已加载
      resolve(true);
      return;
    }
    
    document.fonts.load(`16px "${fontFamily}"`).then(() => {
      const loaded = document.fonts.check(`16px "${fontFamily}"`);
      resolve(loaded);
    }).catch(() => {
      resolve(false);
    });
  });
};

// 获取 LXGW WenKai 字体的具体资源 URL（如用户提到的 L3_20_64.woff2）
export const getLXGWWenKaiResourceUrls = () => {
  const baseUrl = 'https://cdn.jsdelivr.net/npm/cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6';
  
  return {
    css: `${baseUrl}/font.min.css`,
    woff2: {
      regular: `${baseUrl}/L3_20_64.woff2`,  // 用户提到的具体文件
      light: `${baseUrl}/L3_20_63.woff2`,
      bold: `${baseUrl}/L3_20_65.woff2`,
    },
    woff: {
      regular: `${baseUrl}/L3_20_64.woff`,
      light: `${baseUrl}/L3_20_63.woff`,
      bold: `${baseUrl}/L3_20_65.woff`,
    }
  };
}; 