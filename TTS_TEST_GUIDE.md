# TTS朗读功能测试指南

## 🎯 测试目标

验证基于readest项目架构的TTS朗读功能是否正常工作，确保：
1. 使用Lobe Edge TTS替换Edge TTS
2. 朗读书籍内容而不是章节目录
3. 所有TTS控制功能正常

## 🛠️ 测试环境准备

### 1. 启动开发服务器
```bash
cd new-x-project
npm run dev
```

### 2. 访问测试页面
- **主要测试**: `/reader?ids=sample-book` - 书籍阅读器中的TTS功能
- **引擎测试**: `/tts-engine-demo` - TTS引擎对比演示
- **Lobe TTS测试**: `/lobe-tts-demo` - Lobe Edge TTS单独测试

## 🧪 功能测试清单

### ✅ 基础TTS功能测试

**在书籍阅读器页面 (`/reader`)**:

1. **TTS控制面板显示**
   - [ ] 页面底部显示TTS控制面板
   - [ ] 包含播放/暂停/停止/前进/后退按钮
   - [ ] 显示当前TTS状态

2. **书籍内容朗读**
   - [ ] 点击播放按钮开始朗读
   - [ ] 确认朗读的是书籍正文内容（不是导航/目录）
   - [ ] 朗读时有高亮显示当前段落
   - [ ] 声音清晰，语速适中

3. **播放控制功能**
   - [ ] 暂停功能正常工作
   - [ ] 恢复播放功能正常
   - [ ] 停止功能立即终止朗读
   - [ ] 前进到下一段功能正常
   - [ ] 后退到上一段功能正常

4. **设置功能**
   - [ ] 可以选择不同语音
   - [ ] 语速调节滑块工作正常
   - [ ] 设置面板显示/隐藏正常

### ✅ Lobe Edge TTS引擎测试

**在Lobe TTS演示页面 (`/lobe-tts-demo`)**:

1. **连接测试**
   - [ ] 点击"测试连接"按钮
   - [ ] 显示连接状态和响应时间
   - [ ] 成功生成测试音频

2. **语音生成测试**
   - [ ] 输入中文文本，成功生成语音
   - [ ] 输入英文文本，成功生成语音
   - [ ] 音频质量清晰，语音自然

3. **语音选择测试**
   - [ ] 可以选择不同的中文语音
   - [ ] 可以选择不同的英文语音
   - [ ] 语音切换后音色明显不同

### ✅ 引擎对比测试

**在TTS引擎演示页面 (`/tts-engine-demo`)**:

1. **Web Speech API测试**
   - [ ] 切换到Web Speech引擎
   - [ ] 成功播放测试文本
   - [ ] 语音来自浏览器本地TTS

2. **Lobe Edge TTS测试**
   - [ ] 切换到Lobe Edge TTS引擎
   - [ ] 成功播放测试文本
   - [ ] 语音质量比Web Speech更自然

3. **引擎切换测试**
   - [ ] 两个引擎间切换正常
   - [ ] 切换后音色和质量有明显差异

## 🎨 用户体验测试

### 界面交互测试
1. **响应性测试**
   - [ ] 按钮点击响应及时
   - [ ] 状态更新实时显示
   - [ ] 无明显卡顿或延迟

2. **视觉反馈测试**
   - [ ] 播放状态图标正确显示
   - [ ] 朗读时有视觉高亮
   - [ ] 设置面板样式美观

3. **错误处理测试**
   - [ ] 网络断开时显示错误提示
   - [ ] 无法朗读内容时给出友好提示
   - [ ] 错误不会导致页面崩溃

### 性能测试
1. **初始化速度**
   - [ ] TTS控制器初始化时间 < 2秒
   - [ ] 语音列表加载时间 < 3秒

2. **响应速度**
   - [ ] 播放按钮到开始朗读 < 1秒
   - [ ] 暂停响应时间 < 0.5秒
   - [ ] 语音切换时间 < 2秒

## 🐛 已知问题和限制

### Lobe Edge TTS限制
1. **网络依赖**: 需要稳定的网络连接
2. **请求频率**: 可能有API调用频率限制
3. **语音支持**: 依赖Lobe Hub提供的语音模型

### 浏览器兼容性
1. **Web Speech API**: 在某些浏览器中功能有限
2. **音频播放**: 需要用户交互才能自动播放
3. **CORS限制**: 某些环境下可能有跨域问题

## 🔧 故障排除

### 常见问题解决方案

1. **TTS无法初始化**
   - 检查网络连接
   - 确认Lobe TTS服务可用性
   - 查看浏览器控制台错误信息

2. **没有声音输出**
   - 检查系统音量设置
   - 确认浏览器允许音频播放
   - 尝试用户交互后再播放

3. **朗读内容不正确**
   - 确认书籍内容已正确加载
   - 检查content selectors设置
   - 验证SSML生成逻辑

4. **语音质量问题**
   - 尝试切换不同语音
   - 检查网络带宽
   - 调整语速设置

## 📊 测试报告模板

### 测试结果记录
```
测试日期: ___________
测试人员: ___________
浏览器版本: ___________
操作系统: ___________

基础功能测试:
- TTS初始化: ✅/❌
- 内容朗读: ✅/❌  
- 播放控制: ✅/❌
- 设置功能: ✅/❌

引擎测试:
- Lobe Edge TTS: ✅/❌
- Web Speech API: ✅/❌
- 引擎切换: ✅/❌

性能测试:
- 初始化速度: _____ 秒
- 响应速度: _____ 秒
- 内存使用: _____ MB

问题记录:
1. _________________________
2. _________________________
3. _________________________

整体评价: ⭐⭐⭐⭐⭐
建议改进: _________________________
```

## 🎉 成功标准

TTS功能被认为测试通过的标准：

1. **功能完整性**: 所有核心功能正常工作
2. **内容准确性**: 确实朗读书籍内容而非目录
3. **引擎稳定性**: Lobe Edge TTS和备选引擎都可用
4. **用户体验**: 界面友好，响应及时
5. **错误处理**: 异常情况下不会崩溃

通过这些测试，我们可以确信TTS功能已经成功从readest项目迁移，并且使用Lobe Edge TTS提供了更好的语音质量。