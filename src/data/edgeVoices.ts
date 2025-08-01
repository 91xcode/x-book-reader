// 完整的Edge TTS语音列表
export interface EdgeVoice {
  name: string;
  shortName: string;
  gender: 'Male' | 'Female';
  locale: string;
  language: string;
  country: string;
  description?: string;
  personalities?: string[];
  categories?: string[];
}

export const EDGE_VOICES: EdgeVoice[] = [
  // 中文语音
  { name: '晓晓 (Xiaoxiao)', shortName: 'zh-CN-XiaoxiaoNeural', gender: 'Female', locale: 'zh-CN', language: '中文', country: '中国大陆', personalities: ['温暖'], categories: ['新闻', '小说'] },
  { name: '云希 (Yunxi)', shortName: 'zh-CN-YunxiNeural', gender: 'Male', locale: 'zh-CN', language: '中文', country: '中国大陆', personalities: ['活泼', '阳光'], categories: ['小说'] },
  { name: '云扬 (Yunyang)', shortName: 'zh-CN-YunyangNeural', gender: 'Male', locale: 'zh-CN', language: '中文', country: '中国大陆', personalities: ['专业', '可靠'], categories: ['新闻'] },
  { name: '晓伊 (Xiaoyi)', shortName: 'zh-CN-XiaoyiNeural', gender: 'Female', locale: 'zh-CN', language: '中文', country: '中国大陆', personalities: ['活泼'], categories: ['卡通', '小说'] },
  { name: '云健 (Yunjian)', shortName: 'zh-CN-YunjianNeural', gender: 'Male', locale: 'zh-CN', language: '中文', country: '中国大陆', personalities: ['激情'], categories: ['体育', '小说'] },
  { name: '云夏 (Yunxia)', shortName: 'zh-CN-YunxiaNeural', gender: 'Male', locale: 'zh-CN', language: '中文', country: '中国大陆', personalities: ['可爱'], categories: ['卡通', '小说'] },

  // 中文 - 香港
  { name: '曉佳 (HiuGaai)', shortName: 'zh-HK-HiuGaaiNeural', gender: 'Female', locale: 'zh-HK', language: '中文', country: '香港', personalities: ['友好', '积极'] },
  { name: '曉曼 (HiuMaan)', shortName: 'zh-HK-HiuMaanNeural', gender: 'Female', locale: 'zh-HK', language: '中文', country: '香港', personalities: ['友好', '积极'] },
  { name: '雲龍 (WanLung)', shortName: 'zh-HK-WanLungNeural', gender: 'Male', locale: 'zh-HK', language: '中文', country: '香港', personalities: ['友好', '积极'] },

  // 中文 - 台湾
  { name: '曉臻 (HsiaoChen)', shortName: 'zh-TW-HsiaoChenNeural', gender: 'Female', locale: 'zh-TW', language: '中文', country: '台湾', personalities: ['友好', '积极'] },
  { name: '雲哲 (YunJhe)', shortName: 'zh-TW-YunJheNeural', gender: 'Male', locale: 'zh-TW', language: '中文', country: '台湾', personalities: ['友好', '积极'] },
  { name: '曉雨 (HsiaoYu)', shortName: 'zh-TW-HsiaoYuNeural', gender: 'Female', locale: 'zh-TW', language: '中文', country: '台湾', personalities: ['友好', '积极'] },

  // 英语 - 美国
  { name: 'Aria', shortName: 'en-US-AriaNeural', gender: 'Female', locale: 'en-US', language: 'English', country: 'United States', personalities: ['积极', '自信'], categories: ['新闻', '小说'] },
  { name: 'Jenny', shortName: 'en-US-JennyNeural', gender: 'Female', locale: 'en-US', language: 'English', country: 'United States', personalities: ['友好', '体贴', '舒适'], categories: ['对话', '新闻'] },
  { name: 'Guy', shortName: 'en-US-GuyNeural', gender: 'Male', locale: 'en-US', language: 'English', country: 'United States', personalities: ['激情'], categories: ['新闻', '小说'] },
  { name: 'Ana', shortName: 'en-US-AnaNeural', gender: 'Female', locale: 'en-US', language: 'English', country: 'United States', personalities: ['可爱'], categories: ['卡通', '对话'] },
  { name: 'Christopher', shortName: 'en-US-ChristopherNeural', gender: 'Male', locale: 'en-US', language: 'English', country: 'United States', personalities: ['可靠', '权威'], categories: ['新闻', '小说'] },
  { name: 'Eric', shortName: 'en-US-EricNeural', gender: 'Male', locale: 'en-US', language: 'English', country: 'United States', personalities: ['理性'], categories: ['新闻', '小说'] },
  { name: 'Michelle', shortName: 'en-US-MichelleNeural', gender: 'Female', locale: 'en-US', language: 'English', country: 'United States', personalities: ['友好', '愉快'], categories: ['新闻', '小说'] },
  { name: 'Roger', shortName: 'en-US-RogerNeural', gender: 'Male', locale: 'en-US', language: 'English', country: 'United States', personalities: ['活泼'], categories: ['新闻', '小说'] },
  { name: 'Steffan', shortName: 'en-US-SteffanNeural', gender: 'Male', locale: 'en-US', language: 'English', country: 'United States', personalities: ['理性'], categories: ['新闻', '小说'] },

  // 英语 - 英国
  { name: 'Libby', shortName: 'en-GB-LibbyNeural', gender: 'Female', locale: 'en-GB', language: 'English', country: 'United Kingdom', personalities: ['友好', '积极'] },
  { name: 'Maisie', shortName: 'en-GB-MaisieNeural', gender: 'Female', locale: 'en-GB', language: 'English', country: 'United Kingdom', personalities: ['友好', '积极'] },
  { name: 'Ryan', shortName: 'en-GB-RyanNeural', gender: 'Male', locale: 'en-GB', language: 'English', country: 'United Kingdom', personalities: ['友好', '积极'] },
  { name: 'Sonia', shortName: 'en-GB-SoniaNeural', gender: 'Female', locale: 'en-GB', language: 'English', country: 'United Kingdom', personalities: ['友好', '积极'] },
  { name: 'Thomas', shortName: 'en-GB-ThomasNeural', gender: 'Male', locale: 'en-GB', language: 'English', country: 'United Kingdom', personalities: ['友好', '积极'] },

  // 英语 - 澳大利亚
  { name: 'Natasha', shortName: 'en-AU-NatashaNeural', gender: 'Female', locale: 'en-AU', language: 'English', country: 'Australia', personalities: ['友好', '积极'] },
  { name: 'William', shortName: 'en-AU-WilliamNeural', gender: 'Male', locale: 'en-AU', language: 'English', country: 'Australia', personalities: ['友好', '积极'] },

  // 英语 - 加拿大
  { name: 'Clara', shortName: 'en-CA-ClaraNeural', gender: 'Female', locale: 'en-CA', language: 'English', country: 'Canada', personalities: ['友好', '积极'] },
  { name: 'Liam', shortName: 'en-CA-LiamNeural', gender: 'Male', locale: 'en-CA', language: 'English', country: 'Canada', personalities: ['友好', '积极'] },

  // 英语 - 印度
  { name: 'Neerja', shortName: 'en-IN-NeerjaNeural', gender: 'Female', locale: 'en-IN', language: 'English', country: 'India', personalities: ['友好', '积极'] },
  { name: 'Prabhat', shortName: 'en-IN-PrabhatNeural', gender: 'Male', locale: 'en-IN', language: 'English', country: 'India', personalities: ['友好', '积极'] },

  // 日语
  { name: 'Nanami (ななみ)', shortName: 'ja-JP-NanamiNeural', gender: 'Female', locale: 'ja-JP', language: '日本語', country: '日本', personalities: ['友好', '积极'] },
  { name: 'Keita (けいた)', shortName: 'ja-JP-KeitaNeural', gender: 'Male', locale: 'ja-JP', language: '日本語', country: '日本', personalities: ['友好', '积极'] },

  // 韩语
  { name: 'SunHi (선희)', shortName: 'ko-KR-SunHiNeural', gender: 'Female', locale: 'ko-KR', language: '한국어', country: '대한민국', personalities: ['友好', '积极'] },
  { name: 'InJoon (인준)', shortName: 'ko-KR-InJoonNeural', gender: 'Male', locale: 'ko-KR', language: '한국어', country: '대한민국', personalities: ['友好', '积极'] },

  // 法语 - 法国
  { name: 'Denise', shortName: 'fr-FR-DeniseNeural', gender: 'Female', locale: 'fr-FR', language: 'Français', country: 'France', personalities: ['友好', '积极'] },
  { name: 'Henri', shortName: 'fr-FR-HenriNeural', gender: 'Male', locale: 'fr-FR', language: 'Français', country: 'France', personalities: ['友好', '积极'] },
  { name: 'Eloise', shortName: 'fr-FR-EloiseNeural', gender: 'Female', locale: 'fr-FR', language: 'Français', country: 'France', personalities: ['友好', '积极'] },

  // 法语 - 加拿大
  { name: 'Sylvie', shortName: 'fr-CA-SylvieNeural', gender: 'Female', locale: 'fr-CA', language: 'Français', country: 'Canada', personalities: ['友好', '积极'] },
  { name: 'Antoine', shortName: 'fr-CA-AntoineNeural', gender: 'Male', locale: 'fr-CA', language: 'Français', country: 'Canada', personalities: ['友好', '积极'] },
  { name: 'Jean', shortName: 'fr-CA-JeanNeural', gender: 'Male', locale: 'fr-CA', language: 'Français', country: 'Canada', personalities: ['友好', '积极'] },

  // 德语
  { name: 'Katja', shortName: 'de-DE-KatjaNeural', gender: 'Female', locale: 'de-DE', language: 'Deutsch', country: 'Deutschland', personalities: ['友好', '积极'] },
  { name: 'Conrad', shortName: 'de-DE-ConradNeural', gender: 'Male', locale: 'de-DE', language: 'Deutsch', country: 'Deutschland', personalities: ['友好', '积极'] },
  { name: 'Amala', shortName: 'de-DE-AmalaNeural', gender: 'Female', locale: 'de-DE', language: 'Deutsch', country: 'Deutschland', personalities: ['友好', '积极'] },
  { name: 'Killian', shortName: 'de-DE-KillianNeural', gender: 'Male', locale: 'de-DE', language: 'Deutsch', country: 'Deutschland', personalities: ['友好', '积极'] },

  // 西班牙语 - 西班牙
  { name: 'Elvira', shortName: 'es-ES-ElviraNeural', gender: 'Female', locale: 'es-ES', language: 'Español', country: 'España', personalities: ['友好', '积极'] },
  { name: 'Alvaro', shortName: 'es-ES-AlvaroNeural', gender: 'Male', locale: 'es-ES', language: 'Español', country: 'España', personalities: ['友好', '积极'] },

  // 西班牙语 - 墨西哥
  { name: 'Dalia', shortName: 'es-MX-DaliaNeural', gender: 'Female', locale: 'es-MX', language: 'Español', country: 'México', personalities: ['友好', '积极'] },
  { name: 'Jorge', shortName: 'es-MX-JorgeNeural', gender: 'Male', locale: 'es-MX', language: 'Español', country: 'México', personalities: ['友好', '积极'] },

  // 意大利语
  { name: 'Elsa', shortName: 'it-IT-ElsaNeural', gender: 'Female', locale: 'it-IT', language: 'Italiano', country: 'Italia', personalities: ['友好', '积极'] },
  { name: 'Isabella', shortName: 'it-IT-IsabellaNeural', gender: 'Female', locale: 'it-IT', language: 'Italiano', country: 'Italia', personalities: ['友好', '积极'] },
  { name: 'Diego', shortName: 'it-IT-DiegoNeural', gender: 'Male', locale: 'it-IT', language: 'Italiano', country: 'Italia', personalities: ['友好', '积极'] },

  // 葡萄牙语 - 巴西
  { name: 'Francisca', shortName: 'pt-BR-FranciscaNeural', gender: 'Female', locale: 'pt-BR', language: 'Português', country: 'Brasil', personalities: ['友好', '积极'] },
  { name: 'Antonio', shortName: 'pt-BR-AntonioNeural', gender: 'Male', locale: 'pt-BR', language: 'Português', country: 'Brasil', personalities: ['友好', '积极'] },

  // 葡萄牙语 - 葡萄牙
  { name: 'Raquel', shortName: 'pt-PT-RaquelNeural', gender: 'Female', locale: 'pt-PT', language: 'Português', country: 'Portugal', personalities: ['友好', '积极'] },
  { name: 'Duarte', shortName: 'pt-PT-DuarteNeural', gender: 'Male', locale: 'pt-PT', language: 'Português', country: 'Portugal', personalities: ['友好', '积极'] },

  // 俄语
  { name: 'Svetlana', shortName: 'ru-RU-SvetlanaNeural', gender: 'Female', locale: 'ru-RU', language: 'Русский', country: 'Россия', personalities: ['友好', '积极'] },
  { name: 'Dmitry', shortName: 'ru-RU-DmitryNeural', gender: 'Male', locale: 'ru-RU', language: 'Русский', country: 'Россия', personalities: ['友好', '积极'] },

  // 阿拉伯语
  { name: 'Salma', shortName: 'ar-EG-SalmaNeural', gender: 'Female', locale: 'ar-EG', language: 'العربية', country: 'مصر', personalities: ['友好', '积极'] },
  { name: 'Shakir', shortName: 'ar-EG-ShakirNeural', gender: 'Male', locale: 'ar-EG', language: 'العربية', country: 'مصر', personalities: ['友好', '积极'] },

  // 印地语
  { name: 'Swara', shortName: 'hi-IN-SwaraNeural', gender: 'Female', locale: 'hi-IN', language: 'हिन्दी', country: 'भारत', personalities: ['友好', '积极'] },
  { name: 'Madhur', shortName: 'hi-IN-MadhurNeural', gender: 'Male', locale: 'hi-IN', language: 'हिन्दी', country: 'भारत', personalities: ['友好', '积极'] },

  // 泰语
  { name: 'Premwadee', shortName: 'th-TH-PremwadeeNeural', gender: 'Female', locale: 'th-TH', language: 'ไทย', country: 'ไทย', personalities: ['友好', '积极'] },
  { name: 'Niwat', shortName: 'th-TH-NiwatNeural', gender: 'Male', locale: 'th-TH', language: 'ไทย', country: 'ไทย', personalities: ['友好', '积极'] },

  // 越南语
  { name: 'HoaiMy', shortName: 'vi-VN-HoaiMyNeural', gender: 'Female', locale: 'vi-VN', language: 'Tiếng Việt', country: 'Việt Nam', personalities: ['友好', '积极'] },
  { name: 'NamMinh', shortName: 'vi-VN-NamMinhNeural', gender: 'Male', locale: 'vi-VN', language: 'Tiếng Việt', country: 'Việt Nam', personalities: ['友好', '积极'] },

  // 荷兰语
  { name: 'Colette', shortName: 'nl-NL-ColetteNeural', gender: 'Female', locale: 'nl-NL', language: 'Nederlands', country: 'Nederland', personalities: ['友好', '积极'] },
  { name: 'Fenna', shortName: 'nl-NL-FennaNeural', gender: 'Female', locale: 'nl-NL', language: 'Nederlands', country: 'Nederland', personalities: ['友好', '积极'] },
  { name: 'Maarten', shortName: 'nl-NL-MaartenNeural', gender: 'Male', locale: 'nl-NL', language: 'Nederlands', country: 'Nederland', personalities: ['友好', '积极'] },

  // 瑞典语
  { name: 'Sofie', shortName: 'sv-SE-SofieNeural', gender: 'Female', locale: 'sv-SE', language: 'Svenska', country: 'Sverige', personalities: ['友好', '积极'] },
  { name: 'Mattias', shortName: 'sv-SE-MattiasNeural', gender: 'Male', locale: 'sv-SE', language: 'Svenska', country: 'Sverige', personalities: ['友好', '积极'] },

  // 丹麦语
  { name: 'Christel', shortName: 'da-DK-ChristelNeural', gender: 'Female', locale: 'da-DK', language: 'Dansk', country: 'Danmark', personalities: ['友好', '积极'] },
  { name: 'Jeppe', shortName: 'da-DK-JeppeNeural', gender: 'Male', locale: 'da-DK', language: 'Dansk', country: 'Danmark', personalities: ['友好', '积极'] },

  // 挪威语
  { name: 'Pernille', shortName: 'nb-NO-PernilleNeural', gender: 'Female', locale: 'nb-NO', language: 'Norsk', country: 'Norge', personalities: ['友好', '积极'] },
  { name: 'Finn', shortName: 'nb-NO-FinnNeural', gender: 'Male', locale: 'nb-NO', language: 'Norsk', country: 'Norge', personalities: ['友好', '积极'] },

  // 芬兰语
  { name: 'Noora', shortName: 'fi-FI-NooraNeural', gender: 'Female', locale: 'fi-FI', language: 'Suomi', country: 'Suomi', personalities: ['友好', '积极'] },
  { name: 'Harri', shortName: 'fi-FI-HarriNeural', gender: 'Male', locale: 'fi-FI', language: 'Suomi', country: 'Suomi', personalities: ['友好', '积极'] },

  // 更多语言可以继续添加...
];

// 按语言分组
export const getVoicesByLanguage = () => {
  const grouped: Record<string, EdgeVoice[]> = {};
  EDGE_VOICES.forEach(voice => {
    if (!grouped[voice.language]) {
      grouped[voice.language] = [];
    }
    grouped[voice.language].push(voice);
  });
  return grouped;
};

// 按国家/地区分组
export const getVoicesByCountry = () => {
  const grouped: Record<string, EdgeVoice[]> = {};
  EDGE_VOICES.forEach(voice => {
    if (!grouped[voice.country]) {
      grouped[voice.country] = [];
    }
    grouped[voice.country].push(voice);
  });
  return grouped;
};

// 搜索语音
export const searchVoices = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return EDGE_VOICES.filter(voice => 
    voice.name.toLowerCase().includes(lowerQuery) ||
    voice.language.toLowerCase().includes(lowerQuery) ||
    voice.country.toLowerCase().includes(lowerQuery) ||
    voice.shortName.toLowerCase().includes(lowerQuery)
  );
};

// 获取推荐语音（热门语言）
export const getRecommendedVoices = () => {
  return EDGE_VOICES.filter(voice => 
    ['zh-CN', 'en-US', 'en-GB', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES'].includes(voice.locale)
  );
};