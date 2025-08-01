# Lobe TTS 设为默认引擎

## 🎯 修改内容

已将 **Lobe Edge TTS** 设置为默认的TTS引擎，确保用户获得最佳的语音合成体验。

## 🔧 具体修改

### 1. TTSController 构造函数
```typescript
constructor(appService: AppService | null, view: FoliateView) {
  super();
  this.ttsWebClient = new WebSpeechClient(this);
  this.ttsLobeEdgeClient = new LobeEdgeTTSClient(this);
  // 默认使用 Lobe Edge TTS
  this.ttsClient = this.ttsLobeEdgeClient;
  this.appService = appService;
  this.view = view;
}
```

### 2. 初始化优先级
```typescript
async init() {
  // 优先初始化 Lobe Edge TTS（默认引擎）
  if (await this.ttsLobeEdgeClient.init()) {
    availableClients.push(this.ttsLobeEdgeClient);
    console.log('✅ Lobe Edge TTS 初始化成功（默认引擎）');
  }
  
  // Web Speech API 作为备选
  if (await this.ttsWebClient.init()) {
    availableClients.push(this.ttsWebClient);
    console.log('✅ Web Speech API 初始化成功（备选引擎）');
  }
  
  // 设置默认客户端：优先使用 Lobe Edge TTS
  if (availableClients.includes(this.ttsLobeEdgeClient)) {
    this.ttsClient = this.ttsLobeEdgeClient;
    console.log('🎯 使用 Lobe Edge TTS 作为默认引擎');
  }
}
```

### 3. 用户偏好设置
```typescript
static getPreferredClient(): string | undefined {
  return this.clientPreferences.get('preferred') || 'lobe-edge-tts';
}
```

## 📊 引擎优先级

1. **首选**: Lobe Edge TTS - 高质量云端语音合成
2. **备选**: Web Speech API - 本地浏览器TTS
3. **降级**: 如果所有引擎都失败，仍尝试使用 Lobe Edge TTS

## 🎨 用户体验改进

### 控制台输出
- ✅ Lobe Edge TTS 初始化成功（默认引擎）
- 🎯 使用 Lobe Edge TTS 作为默认引擎
- 🔄 降级使用 Web Speech API（仅在Lobe TTS不可用时）

### 界面显示
- TTSControl 组件默认显示 "lobe-edge-tts"
- 演示页面默认选择 Lobe TTS 引擎
- 设置面板默认显示 Lobe Edge TTS 选项

## 🌟 Lobe Edge TTS 优势

1. **语音质量**: 更自然、更流畅的语音合成
2. **多语言支持**: 丰富的多语言语音选择
3. **API稳定性**: 基于成熟的Edge TTS技术
4. **语音选择**: 更多样化的语音角色和音色

## 🔄 降级机制

如果 Lobe Edge TTS 不可用：
1. 自动检测初始化状态
2. 降级到 Web Speech API
3. 提供友好的错误提示
4. 保持功能完整性

## ✅ 测试验证

现在用户打开TTS功能时：
1. 默认使用 Lobe Edge TTS
2. 享受高质量语音合成
3. 网络问题时自动降级
4. 控制台显示清晰的引擎状态

Lobe Edge TTS 已成功设置为默认引擎！🎉