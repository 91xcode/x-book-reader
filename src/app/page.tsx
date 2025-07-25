'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '@/utils/electronCheck' // 导入Electron环境检查

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to library page
    router.push('/library')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">NewX Project</h1>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  )
} 