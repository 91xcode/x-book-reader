# CDN 字体迁移功能文档

## 概述

本项目已成功迁移了 readest 项目的 CDN 字体加载功能，特别是 `LXGW WenKai GB Screen` 字体的加载机制。

## 功能特点

### 1. 完全兼容 readest 项目
- ✅ 使用相同的 CDN 资源：`https://cdn.jsdelivr.net/npm/cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6/font.min.css`
- ✅ 包含相同的字体文件：`L3_20_64.woff2` 等
- ✅ 支持所有 readest 中的 CJK 字体

### 2. 灵活的字体加载策略
支持 4 种字体加载策略：

```typescript
type FontLoadStrategy = 'local-only' | 'cdn-only' | 'local-first' | 'cdn-first'
```

- **`local-only`**: 仅使用本地字体文件
- **`local-first`**: 本地优先，CDN 补充（推荐）
- **`cdn-first`**: CDN 优先，本地回退
- **`cdn-only`**: 仅使用 CDN 字体（完全 readest 模式）

### 3. 智能 CJK 检测
自动检测用户环境是否需要 CJK 字体：
- 基于浏览器语言设置
- 基于 UI 语言偏好
- 支持中文、日文、韩文环境

## 使用方法

### 1. 基本用法
```tsx
import ThemeProvider from '@/components/ThemeProvider'

// 使用默认策略（local-first）
<ThemeProvider>
  {children}
</ThemeProvider>

// 指定字体策略
<ThemeProvider fontStrategy="cdn-only">
  {children}
</ThemeProvider>
```

### 2. 程序化控制
```typescript
import { 
  loadFontsWithStrategy, 
  removeCDNFonts,
  getLXGWWenKaiResourceUrls 
} from '@/utils/fontLoader'

// 加载 CDN 字体
loadFontsWithStrategy(document, 'cdn-only', true)

// 移除 CDN 字体
removeCDNFonts(document)

// 获取具体字体资源 URL
const urls = getLXGWWenKaiResourceUrls()
console.log(urls.woff2.regular) // L3_20_64.woff2
```

### 3. 检查字体加载状态
```typescript
import { isCDNFontLoaded } from '@/utils/fontLoader'

// 检查特定字体是否已加载
const isLoaded = await isCDNFontLoaded('LXGW WenKai GB Screen')
```

## 字体资源详情

### LXGW WenKai GB Screen
- **CDN 包**: `cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6`
- **主 CSS**: `font.min.css`
- **核心文件**: `L3_20_64.woff2` (用户提到的文件)
- **支持格式**: WOFF2, WOFF, TTF

### 完整字体列表
CDN 模式会加载以下字体：
- LXGW WenKai GB Screen (主要目标)
- MiSans L3
- 汇文明朝体
- 京华老宋体
- Source Han Serif CN
- GuanKiapTsingKhai-T
- Google Fonts (Noto Sans SC, LXGW WenKai TC 等)

## 开发调试

### 开发模式字体测试
在开发环境下，右上角会显示字体测试面板：
- 显示当前字体策略
- 显示本地/CDN 字体加载状态
- 提供字体渲染测试文本
- 显示当前使用的 CDN 包信息

### 控制台日志
字体加载过程会在控制台输出详细日志：
```
🌐 开始加载 CDN 字体（readest 风格）
✅ CDN 字体加载完成 - 包含 LXGW WenKai GB Screen
🎯 混合字体系统最终状态
```

## 配置示例

### 1. 完全 readest 模式
```tsx
<ThemeProvider fontStrategy="cdn-only">
  {children}
</ThemeProvider>
```

### 2. 混合模式（推荐）
```tsx
<ThemeProvider fontStrategy="local-first">
  {children}
</ThemeProvider>
```

### 3. 离线模式
```tsx
<ThemeProvider fontStrategy="local-only">
  {children}
</ThemeProvider>
```

## 性能考虑

### 本地优先策略的优势
- ⚡ 更快的首屏渲染
- 📱 减少网络依赖
- 💾 节省带宽

### CDN 策略的优势
- 🌍 完整字体支持
- 🔄 自动更新
- 📚 丰富的字体变体

## 迁移检查清单

- [x] 迁移 readest 的字体 CDN 配置
- [x] 支持 `cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6`
- [x] 包含 `L3_20_64.woff2` 等核心文件
- [x] 实现字体加载策略选择
- [x] 添加 CJK 环境检测
- [x] 提供开发调试工具
- [x] 兼容现有本地字体系统

## 故障排除

### 字体未正确加载
1. 检查网络连接
2. 确认 CDN 可访问性
3. 查看控制台错误信息
4. 尝试切换字体策略

### 本地字体优先级问题
1. 确认字体策略设置
2. 检查 CSS 字体栈顺序
3. 验证本地字体文件存在

### CJK 字体不显示
1. 确认 CJK 环境检测结果
2. 手动启用 CJK 字体加载
3. 检查字符编码设置

### 字体预加载警告
- ✅ **已修复**: `<link rel=preload> has an unsupported type value`
- ✅ **已修复**: `The resource was preloaded but not used within a few seconds`
- ✅ **已优化**: 移除未使用的字体预加载
- ✅ **已添加**: 智能字体预加载系统

## 性能优化

### 字体加载优化策略
1. **核心字体预加载**: 仅预加载必需的字体文件
2. **智能按需加载**: 检测页面内容后动态加载次要字体
3. **性能监控**: 实时监控字体加载性能
4. **自动清理**: 移除未使用的预加载链接

### 优化后的加载流程
```
1. 页面加载 → 预加载核心字体（Regular 字体）
2. 内容渲染 → 检测是否需要粗体字体
3. 按需加载 → 动态加载 Bold 字体（如需要）
4. 性能监控 → 记录字体加载时间
5. 自动清理 → 移除未使用的预加载
``` 