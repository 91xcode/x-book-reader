'use client';
import React, { useState, useRef, useEffect } from 'react';
import { EdgeSpeechTTS } from '@lobehub/tts';
import { EDGE_VOICES, getVoicesByLanguage, getRecommendedVoices, searchVoices, type EdgeVoice } from '@/data/edgeVoices';

const DEMO_TEXTS = {
  chinese: '人工智能技术正在快速发展，语音合成技术已经非常成熟。现在我们可以通过不同的引擎来体验高质量的文本朗读功能。',
  english: 'Artificial intelligence technology is developing rapidly, and speech synthesis technology has become very mature. We can now experience high-quality text-to-speech functionality through different engines.',
  poem: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
  tech: 'Edge TTS是微软提供的云端语音合成服务，具有高质量的神经网络语音。通过Lobe TTS库，我们可以在浏览器中直接使用这些高品质的语音。'
};

// 语音分组数据
const voicesByLanguage = getVoicesByLanguage();
const recommendedVoices = getRecommendedVoices();

export default function LobeTTSDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState(DEMO_TEXTS.chinese);
  const [selectedVoice, setSelectedVoice] = useState(EDGE_VOICES[0].shortName);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [logs, setLogs] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('推荐');
  const [showAllVoices, setShowAllVoices] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ttsRef = useRef<EdgeSpeechTTS | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-8), `[${timestamp}] ${message}`]);
  };

  // 获取筛选后的语音列表
  const getFilteredVoices = (): EdgeVoice[] => {
    if (voiceSearchQuery) {
      return searchVoices(voiceSearchQuery);
    }
    if (selectedLanguage === '推荐') {
      return recommendedVoices;
    }
    if (selectedLanguage === '全部') {
      return EDGE_VOICES;
    }
    return voicesByLanguage[selectedLanguage] || [];
  };

  // 初始化 Edge TTS
  useEffect(() => {
    try {
      // 设置当前语音对应的语言
      const currentVoice = EDGE_VOICES.find(v => v.shortName === selectedVoice);
      const locale = currentVoice?.locale || 'zh-CN';
      
      // 简化初始化，只设置 locale
      ttsRef.current = new EdgeSpeechTTS({ 
        locale
      });
      
      addLog(`🚀 Edge TTS 初始化成功 (${currentVoice?.name})`);
    } catch (error) {
      addLog(`❌ Edge TTS 初始化失败: ${error}`);
      console.error('Edge TTS initialization failed:', error);
    }
  }, [selectedVoice]);

  const handleSpeak = async () => {
    if (isPlaying) {
      handleStop();
      return;
    }

    if (!currentText.trim()) {
      addLog('❌ 请输入要朗读的文本');
      return;
    }

    if (!ttsRef.current) {
      addLog('❌ Edge TTS 未初始化');
      return;
    }

    try {
      setIsLoading(true);
      addLog(`🎵 开始生成语音: "${currentText.substring(0, 30)}..."`);
      
      const currentVoice = EDGE_VOICES.find(v => v.shortName === selectedVoice);
      addLog(`🎤 使用语音: ${currentVoice?.name} (${currentVoice?.language})`);
      addLog(`🎛️ 参数设置: 语速 ${rate.toFixed(1)}x, 音调 ${pitch.toFixed(1)}x`);

      // 创建语音合成请求 - 简化参数，避免格式问题
      const payload = {
        input: currentText.length > 500 ? currentText.substring(0, 500) + '...' : currentText, // 限制长度
        options: {
          voice: selectedVoice,
          // 使用数值格式，让库自己处理
          ...(rate !== 1.0 && { rate: rate.toString() }),
          ...(pitch !== 1.0 && { pitch: pitch.toString() })
        }
      };

      addLog('🔄 正在调用 Edge TTS API...');

      // 添加30秒超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时 (30秒)')), 30000);
      });

      // 调用 Edge TTS 生成音频，带超时控制
      const response = await Promise.race([
        ttsRef.current.create(payload),
        timeoutPromise
      ]);
      
      addLog('📦 正在处理音频数据...');
      
      // 创建音频 URL
      const audioBlob = await (response as any).blob();
      
      if (audioBlob.size === 0) {
        throw new Error('生成的音频文件为空');
      }
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      addLog(`✅ 语音生成成功，音频大小: ${(audioBlob.size / 1024).toFixed(1)} KB`);
      
      // 播放音频
      if (audioRef.current) {
        audioRef.current.src = url;
        
        // 添加播放错误处理
        audioRef.current.onerror = (e) => {
          addLog(`❌ 音频播放失败: ${e}`);
          setIsPlaying(false);
        };
        
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          addLog('▶️ 开始播放');
        } catch (playError) {
          addLog(`❌ 播放失败: ${playError}`);
          throw playError;
        }
      }

    } catch (error) {
      const err = error as any;
      if (err.message === '请求超时 (30秒)') {
        addLog(`⏱️ ${err.message} - 请检查网络连接或尝试较短的文本`);
      } else if (err.name === 'NetworkError') {
        addLog(`🌐 网络错误: 无法连接到 Edge TTS 服务，请检查网络连接`);
      } else {
        addLog(`❌ 语音生成失败: ${err.message || error}`);
      }
      console.error('TTS generation failed:', error);
      
      // 清理状态
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    addLog('⏹️ 停止播放');
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    addLog('✅ 播放完成');
    
    // 清理音频 URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
  };

  const setQuickText = (key: keyof typeof DEMO_TEXTS) => {
    setCurrentText(DEMO_TEXTS[key]);
    addLog(`📝 已设置文本: ${key}`);
  };

  const handleVoiceChange = (voiceShortName: string) => {
    setSelectedVoice(voiceShortName);
    const voice = EDGE_VOICES.find(v => v.shortName === voiceShortName);
    addLog(`🎤 切换语音: ${voice?.name} (${voice?.language})`);
  };

  // 快速测试连接
  const handleQuickTest = async () => {
    if (!ttsRef.current) {
      addLog('❌ Edge TTS 未初始化');
      return;
    }

    try {
      setIsLoading(true);
      addLog('🧪 开始快速连接测试...');

      const testPayload = {
        input: "Hello",
        options: {
          voice: selectedVoice
        }
      };

      // 5秒快速测试
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('连接测试超时 (5秒)')), 5000);
      });

      const response = await Promise.race([
        ttsRef.current.create(testPayload),
        timeoutPromise
      ]);

      const audioBlob = await (response as any).blob();
      
      if (audioBlob.size > 0) {
        addLog(`✅ 连接测试成功！Edge TTS 服务正常 (${(audioBlob.size / 1024).toFixed(1)} KB)`);
        addLog('💡 可以正常使用语音合成功能');
      } else {
        addLog('⚠️ 连接成功但返回空音频，请检查语音设置');
      }

    } catch (error) {
      const err = error as any;
      if (err.message === '连接测试超时 (5秒)') {
        addLog('⏱️ 连接测试超时 - 网络较慢或服务不可用');
        addLog('💡 建议: 检查网络连接或稍后重试');
      } else {
        addLog(`❌ 连接测试失败: ${err.message || error}`);
        addLog('💡 建议: 检查网络连接或更换语音');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎤 Lobe TTS - Edge TTS 演示</h1>
          <p className="text-lg text-base-content/70">使用 @lobehub/tts 实现真正可用的 Edge TTS</p>
          
          <div className="alert alert-success max-w-md mx-auto mt-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">🌟 真正的微软 Edge TTS 云端语音</span>
          </div>
        </div>

        {/* 语音设置 */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <h2 className="card-title">🎛️ Edge TTS 语音设置 ({EDGE_VOICES.length} 种语音)</h2>
            
            {/* 语音筛选 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 语言选择 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">按语言筛选:</span>
                </label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setVoiceSearchQuery('');
                  }}
                  className="select select-bordered"
                >
                  <option value="推荐">🌟 推荐语音</option>
                  <option value="全部">🌍 全部语音 ({EDGE_VOICES.length})</option>
                  {Object.keys(voicesByLanguage).map(language => (
                    <option key={language} value={language}>
                      {language} ({voicesByLanguage[language].length})
                    </option>
                  ))}
                </select>
              </div>

              {/* 搜索语音 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">搜索语音:</span>
                </label>
                <input
                  type="text"
                  value={voiceSearchQuery}
                  onChange={(e) => setVoiceSearchQuery(e.target.value)}
                  placeholder="输入语音名称、语言或国家..."
                  className="input input-bordered"
                />
              </div>
            </div>

            {/* 语音选择 */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">
                  选择语音: {getFilteredVoices().length} 个可选
                  {voiceSearchQuery && ` (搜索: "${voiceSearchQuery}")`}
                </span>
              </label>
              <select 
                value={selectedVoice} 
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="select select-bordered"
                size={Math.min(8, Math.max(3, getFilteredVoices().length))}
              >
                {getFilteredVoices().map((voice) => (
                  <option key={voice.shortName} value={voice.shortName}>
                    🎤 {voice.name} ({voice.gender}) - {voice.language} ({voice.country})
                  </option>
                ))}
              </select>
            </div>

            {/* 当前语音信息 */}
            <div className="bg-base-300 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">当前语音详情:</div>
              {(() => {
                const currentVoice = EDGE_VOICES.find(v => v.shortName === selectedVoice);
                return currentVoice ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>名称:</strong> {currentVoice.name}</div>
                    <div><strong>性别:</strong> {currentVoice.gender}</div>
                    <div><strong>语言:</strong> {currentVoice.language}</div>
                    <div><strong>地区:</strong> {currentVoice.country}</div>
                    <div className="col-span-2"><strong>语音ID:</strong> {currentVoice.shortName}</div>
                    {currentVoice.personalities && (
                      <div className="col-span-2">
                        <strong>特性:</strong> {currentVoice.personalities.join(', ')}
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
            </div>

            {/* 参数调节 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">语速: {rate.toFixed(1)}x</span>
                  <span className="label-text-alt text-xs">{rate === 1.0 ? '正常' : rate > 1.0 ? '加速' : '减速'}</span>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="range range-primary" 
                />
                <div className="text-xs text-center mt-1 opacity-60">0.5x ← → 2.0x</div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">音调: {pitch.toFixed(1)}x</span>
                  <span className="label-text-alt text-xs">{pitch === 1.0 ? '正常' : pitch > 1.0 ? '升高' : '降低'}</span>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="range range-secondary" 
                />
                <div className="text-xs text-center mt-1 opacity-60">0.5x ← → 2.0x</div>
              </div>
            </div>
            
            {/* 快速重置按钮 */}
            <div className="flex justify-center mt-3">
              <button 
                onClick={() => {
                  setRate(1.0);
                  setPitch(1.0);
                  addLog('🔄 已重置语速和音调为默认值');
                }}
                className="btn btn-outline btn-sm"
              >
                🔄 重置为默认值
              </button>
            </div>
          </div>
        </div>

        {/* 文本输入 */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <h2 className="card-title">📝 朗读文本</h2>
            
            {/* 快速选择 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">快速选择演示文本:</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setQuickText('chinese')}
                  className={`btn btn-outline btn-sm ${currentText === DEMO_TEXTS.chinese ? 'btn-active' : ''}`}
                >
                  中文技术
                </button>
                <button 
                  onClick={() => setQuickText('english')}
                  className={`btn btn-outline btn-sm ${currentText === DEMO_TEXTS.english ? 'btn-active' : ''}`}
                >
                  English Text
                </button>
                <button 
                  onClick={() => setQuickText('poem')}
                  className={`btn btn-outline btn-sm ${currentText === DEMO_TEXTS.poem ? 'btn-active' : ''}`}
                >
                  古诗
                </button>
                <button 
                  onClick={() => setQuickText('tech')}
                  className={`btn btn-outline btn-sm ${currentText === DEMO_TEXTS.tech ? 'btn-active' : ''}`}
                >
                  Edge TTS 介绍
                </button>
              </div>
            </div>

            {/* 文本输入框 */}
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="textarea textarea-bordered w-full h-32"
              placeholder="请输入要朗读的文本..."
            />
            
            <div className="text-xs text-base-content/60 mt-2">
              字符数: {currentText.length}
            </div>
          </div>
        </div>

        {/* 播放控制 */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <h2 className="card-title">🎮 播放控制</h2>
            
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <button
                onClick={handleSpeak}
                disabled={isLoading}
                className={`btn btn-lg ${isPlaying ? 'btn-warning' : 'btn-primary'}`}
              >
                {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                {isLoading ? '🎵 生成中...' :
                 isPlaying ? '⏸️ 停止播放' : '🎤 Edge TTS 合成'}
              </button>
              
              <button
                onClick={handleQuickTest}
                disabled={isLoading}
                className="btn btn-accent btn-lg"
              >
                🧪 快速测试
              </button>
              
              {isPlaying && (
                <button
                  onClick={handleStop}
                  className="btn btn-error btn-lg"
                >
                  ⏹️ 强制停止
                </button>
              )}
            </div>
            
            <div className="text-center mt-4">
              <div className="stat">
                <div className="stat-title">状态</div>
                <div className="stat-value text-lg">
                  {isLoading ? '🎵 合成中' :
                   isPlaying ? '▶️ 播放中' : '⏸️ 已停止'}
                </div>
              </div>
            </div>

            {/* 音频播放器 */}
            <audio
              ref={audioRef}
              onEnded={handleAudioEnd}
              onError={(e) => {
                addLog(`❌ 音频播放错误: ${e.currentTarget.error?.message}`);
                setIsPlaying(false);
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* 实时日志 */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <h2 className="card-title">📊 实时日志</h2>
            
            <div className="bg-base-300 p-4 rounded-lg h-40 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-base-content/50">Edge TTS 准备就绪...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setLogs([])}
              className="btn btn-outline btn-sm mt-2"
            >
              清空日志
            </button>
          </div>
        </div>

        {/* 说明 */}
        <div className="alert alert-info">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <strong>Lobe TTS + Edge TTS 特性:</strong><br/>
            • 🌟 <strong>真正的 Edge TTS</strong>: 使用微软云端神经网络语音<br/>
            • 🎤 <strong>{EDGE_VOICES.length}+ 种语音</strong>: 支持{Object.keys(voicesByLanguage).length}种语言，涵盖全球主要地区<br/>
            • ⚡ <strong>实时生成</strong>: 云端实时合成，音质媲美真人<br/>
            • 🔍 <strong>智能筛选</strong>: 按语言分类、关键词搜索，快速找到理想语音<br/>
            • 🎛️ <strong>参数调节</strong>: 支持语速、音调自定义调节<br/>
            • 🌐 <strong>浏览器直用</strong>: 基于 @lobehub/tts，无需后端代理
          </div>
        </div>

      </div>
    </div>
  );
}