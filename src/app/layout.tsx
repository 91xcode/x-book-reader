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
        {/* CDN字体预连接 - 提升CDN连接性能 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fontsapi.zeoseven.com" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
