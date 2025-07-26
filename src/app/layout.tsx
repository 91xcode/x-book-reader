import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/fonts.css' // 恢复本地字体CSS
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
        <link rel="preload" href="/fonts/roboto/Roboto-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/bitter/Bitter-Variable.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/lxgw/LXGWWenKai-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
