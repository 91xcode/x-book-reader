import type { Metadata } from 'next'
import '@/styles/globals.css'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'NewX Project - Ebook Reader',
  description: 'A modern ebook reader built with Electron and Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* 本地字体预加载 - 提升性能 */}
        <link rel="preload" href="/fonts/roboto/Roboto-Regular.woff2" as="font" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/bitter/Bitter-Variable.ttf" as="font" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/lxgw/LXGWWenKai-Regular.ttf" as="font" crossOrigin="anonymous" />
        
        {/* CDN字体回退 - 仅作为备用 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* 
          字体加载策略选项:
          - 'local-only': 仅使用本地字体
          - 'local-first': 本地优先，CDN 补充（默认）
          - 'cdn-first': CDN 优先，本地回退
          - 'cdn-only': 仅使用 CDN 字体（readest 模式）
        */}
        <ThemeProvider fontStrategy="local-first">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 