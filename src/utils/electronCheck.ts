// 检查Electron环境的工具
export function checkElectronEnvironment() {
  if (typeof window === 'undefined') {
    console.log('🔍 checkElectronEnvironment: 运行在服务器端');
    return;
  }

  console.log('🔍 Electron环境检查:');
  console.log('- typeof window:', typeof window);
  console.log('- window.isElectron:', (window as any).isElectron);
  console.log('- window.electronAPI:', !!(window as any).electronAPI);
  
  if ((window as any).electronAPI) {
    console.log('- electronAPI methods:', Object.keys((window as any).electronAPI));
  }
  
  // 检查所有相关属性
  const electronKeys = Object.keys(window).filter(key => 
    key.toLowerCase().includes('electron') || 
    key.toLowerCase().includes('tauri') ||
    key.toLowerCase().includes('api')
  );
  
  console.log('- window中包含electron/api的属性:', electronKeys);
  
  // 检查userAgent
  console.log('- userAgent:', navigator.userAgent);
  
  // 检查是否在Electron中
  const isElectron = !!(window as any).electronAPI || 
                     navigator.userAgent.toLowerCase().includes('electron');
  
  console.log('- 检测结果: 是否为Electron环境?', isElectron);
  
  return isElectron;
}

// 页面加载后立即检查
if (typeof window !== 'undefined') {
  // 立即检查
  checkElectronEnvironment();
  
  // 延迟检查（等待preload脚本加载）
  setTimeout(() => {
    console.log('🔍 延迟检查 (1秒后):');
    checkElectronEnvironment();
  }, 1000);
  
  // DOM加载完成后检查
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOM加载完成后检查:');
    checkElectronEnvironment();
  });
} 