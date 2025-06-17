"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { parseImageUrl } from "@/lib/parseImageUrl"
import type { Post } from "@/lib/types"
import { ArrowRight, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface FeaturedPostProps {
 readonly post: Post | null
 readonly loading: boolean
}

export function FeaturedPost({ post, loading }: FeaturedPostProps) {
  if (loading || !post) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Bài viết nổi bật</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Đang tải bài viết...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Bài viết nổi bật</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Link href={`/posts/${post._id}`} className="block group">
          <div className="relative overflow-hidden">
            <Image
              src={parseImageUrl(post.bannerImage)}
              alt="Featured article"
              width={800}
              height={400}
              className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white">Nổi bật</Badge>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {post.content?.replace(/<[^>]*>/g, "").slice(0, 200) + "..."}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{post.createdBy?.name || ""}</p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium mr-1">Đọc thêm</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
