import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* 顶部装饰 */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
      
      {/* 主内容区域 */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16">
        
        {/* 头部标题区域 */}
        <div className="text-center mb-16 space-y-6">
          {/* 主标题 */}
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent" 
                style={{ fontFamily: '"LXGW WenKai GB Screen", "Noto Sans SC", serif' }}>
              NewX Project
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          </div>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed" 
             style={{ fontFamily: 'Roboto, "Noto Sans SC", sans-serif' }}>
            现代化的电子书阅读与语音合成平台
          </p>
          
          {/* 描述文字 */}
          <p className="text-lg text-slate-500 dark:text-slate-400" 
             style={{ fontFamily: 'Bitter, "Noto Serif SC", serif' }}>
            集成先进的字体系统与 TTS 技术
          </p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl w-full px-4">
          
          {/* 图书库卡片 */}
          <Link href="/library" 
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl shadow-green-100 dark:shadow-green-900/20 hover:shadow-2xl hover:shadow-green-200 dark:hover:shadow-green-800/30 transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              {/* 图标 */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              {/* 标题 */}
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                图书库
              </h2>
              
              {/* 描述 */}
              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                管理电子书收藏，支持多种格式，智能分类与搜索
              </p>
              
              {/* 箭头指示 */}
              <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                <span>进入图书库</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Lobe TTS Demo 卡片 */}
          <Link href="/lobe-tts-demo" 
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl shadow-purple-100 dark:shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-200 dark:hover:shadow-purple-800/30 transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              {/* 图标 */}
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343a9 9 0 000 12.728m2.121-1.414a5 5 0 000-7.072M9 12h6" />
                </svg>
              </div>
              
              {/* 标题 */}
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                Lobe TTS Demo
              </h2>
              
              {/* 描述 */}
              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                先进的文本转语音技术演示，支持多语言与自然语调
              </p>
              
              {/* 箭头指示 */}
              <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                <span>体验 TTS</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 字体测试卡片 */}
          <Link href="/font-test" 
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-200 dark:hover:shadow-blue-800/30 transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              {/* 图标 */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* 标题 */}
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                字体测试
              </h2>
              
              {/* 描述 */}
              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                CDN 字体加载、动态切换与性能监控系统测试
              </p>
              
              {/* 箭头指示 */}
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <span>开始测试</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </main>
  )
} 