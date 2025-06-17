"use client"

import { Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl mb-6 shadow-lg">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4 h-16">
        Văn Lang Tech Club
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Nơi kết nối đam mê công nghệ, chia sẻ kiến thức và phát triển kỹ năng IT. Tham gia cùng chúng tôi để khám phá
        thế giới công nghệ đầy thú vị!
      </p>
    </div>
  )
}
