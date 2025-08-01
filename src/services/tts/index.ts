// TTS服务导出 - 100%基于readest项目架构
export { TTSController } from './TTSController';
export { EdgeTTSClient } from './LobeTTSClient';
export { TTSUtils, parseSSMLMarks, parseSSMLLang, genSSML, findSSMLMark } from './utils';

// 导出类型 - 完全匹配readest
export type {
  TTSClient,
  TTSMessageEvent,
  TTSVoice,
  TTSVoicesGroup,
  TTSGranularity,
  TTSHighlightOptions,
  TTSState,
  TTSMark,
  AppService,
  FoliateView,
  EdgeTTSPayload
} from '@/types/tts';