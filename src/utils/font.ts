import { isCJKEnv } from './misc';

// 基础Google字体配置
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

// CJK Google字体配置
const cjkGoogleFonts = [
  { family: 'LXGW WenKai TC', weights: '' },
  { family: 'Noto Sans SC', weights: '' },
  { family: 'Noto Sans TC', weights: '' },
  { family: 'Noto Serif JP', weights: '' },
];

// 生成基础字体链接
const getAdditionalBasicFontLinks = () => `
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${basicGoogleFonts
    .map(
      ({ family, weights }) =>
        `family=${encodeURIComponent(family)}${weights ? `:${weights}` : ''}`,
    )
    .join('&')}&display=swap" crossorigin="anonymous">
`;

// 生成CJK字体链接
const getAdditionalCJKFontLinks = () => `
  <link rel="stylesheet" href="https://fontsapi.zeoseven.com/256/main/result.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fontsapi.zeoseven.com/309/main/result.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fontsapi.zeoseven.com/285/main/result.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fontsapi.zeoseven.com/427/main/result.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fontsapi.zeoseven.com/292/main/result.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${cjkGoogleFonts
    .map(
      ({ family, weights }) =>
        `family=${encodeURIComponent(family)}${weights ? `:${weights}` : ''}`,
    )
    .join('&')}&display=swap" crossorigin="anonymous" />
`;

// 生成CJK字体Face定义
const getAdditionalCJKFontFaces = () => `
  @font-face {
    font-family: "FangSong";
    font-display: swap;
    src: local("Fang Song"), local("FangSong"), local("Noto Serif CJK"), local("Source Han Serif SC VF");
  }
  @font-face {
    font-family: "Kaiti";
    font-display: swap;
    src: local("Kai"), local("KaiTi"), local("AR PL UKai"), local("LXGW WenKai GB Screen");
  }
  @font-face {
    font-family: "Heiti";
    font-display: swap;
    src: local("Hei"), local("SimHei"), local("WenQuanYi Zen Hei"), local("Source Han Sans SC VF");
  }
  @font-face {
    font-family: "XiHeiti";
    font-display: swap;
    src: local("PingFang SC"), local("Microsoft YaHei"), local("WenQuanYi Micro Hei"), local("FZHei-B01");
  }
`;

// 🎨 核心函数：mountAdditionalFonts
export const mountAdditionalFonts = (document: Document, isCJK = false) => {
  const mountCJKFonts = isCJK || isCJKEnv();
  let links = getAdditionalBasicFontLinks();
  
  if (mountCJKFonts) {
    // 🎯 动态注入CJK字体样式
    const style = document.createElement('style');
    style.textContent = getAdditionalCJKFontFaces();
    document.head.appendChild(style);

    // 🔗 添加CJK字体链接
    links = `${links}\n${getAdditionalCJKFontLinks()}`;
  }

  // 📄 解析并挂载字体链接
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(links, 'text/html');

  Array.from(parsedDocument.head.children).forEach((child) => {
    if (child.tagName === 'LINK') {
      const link = document.createElement('link');
      link.rel = child.getAttribute('rel') || '';
      link.href = child.getAttribute('href') || '';
      link.crossOrigin = child.getAttribute('crossorigin') || '';
      document.head.appendChild(link);
    }
  });
};

// 📋 导出工具函数
export { getAdditionalBasicFontLinks, getAdditionalCJKFontLinks, getAdditionalCJKFontFaces }; 