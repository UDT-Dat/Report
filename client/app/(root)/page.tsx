"use client"

import type React from "react"
import { useEffect, useState } from "react"

import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Mail,
  Phone,
  MapPinIcon,
  Sparkles,
  TrendingUp,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { fetchApi } from "@/lib/api"
import type { Event, Post } from "@/lib/types"

export default function Home() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetchApi("/posts?page=1&limit=10", { method: "GET" })
        if (response.status === 200) {
          setPosts(response.result.posts || [])
        } else {
          setPosts([])
        }
      } catch (error) {
        setPosts([])
      }
    }
    async function fetchEvents() {
      try {
        const response = await fetchApi("/events?page=1&limit=5", { method: "GET" })
        if (response.status === 200) {
          setEvents(response.result.events || [])
        } else {
          setEvents([])
        }
      } catch (error) {
        setEvents([])
      }
    }
    Promise.all([fetchPosts(), fetchEvents()]).finally(() => {
      setLoading(false)
    })
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      toast({
        title: "Đăng ký thành công!",
        description: "Cảm ơn bạn đã đăng ký nhận tin từ Văn Lang Tech Club.",
        variant: "success",
      })
      setEmail("")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
            Văn Lang Tech Club
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Nơi kết nối đam mê công nghệ, chia sẻ kiến thức và phát triển kỹ năng IT. Tham gia cùng chúng tôi để khám
            phá thế giới công nghệ đầy thú vị!
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">500+</h3>
              <p className="text-gray-600 dark:text-gray-300">Thành viên tích cực</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">50+</h3>
              <p className="text-gray-600 dark:text-gray-300">Sự kiện đã tổ chức</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">100+</h3>
              <p className="text-gray-600 dark:text-gray-300">Bài viết chia sẻ</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Featured Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Article */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Bài viết nổi bật</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading || posts.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Đang tải bài viết...</p>
                    </div>
                  </div>
                ) : (
                  <Link href={`/posts/${posts[0]._id}`} className="block group">
                    <div className="relative overflow-hidden">
                      <Image
                        src={
                          posts[0].bannerImage
                            ? `${process.env.NEXT_PUBLIC_API_URL}/${posts[0].bannerImage}`
                            : "/placeholder.svg"
                        }
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
                        {posts[0].title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {posts[0].content?.replace(/<[^>]*>/g, "").slice(0, 200) + "..."}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{posts[0].createdBy?.name || ""}</p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                          <span className="text-sm font-medium mr-1">Đọc thêm</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Article Grid */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Bài viết gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                {loading || posts.length < 2 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex space-x-4 animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 w-[100px] h-[100px] rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {posts.slice(1, 5).map((post) => (
                      <Link
                        key={post._id}
                        href={`/posts/${post._id}`}
                        className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                      >
                        <Image
                          src={
                            post.bannerImage
                              ? `${process.env.NEXT_PUBLIC_API_URL}/${post.bannerImage}`
                              : "/placeholder.svg"
                          }
                          alt="Article thumbnail"
                          width={100}
                          height={100}
                          className="w-[100px] h-[100px] object-cover rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
                            {post.content?.replace(/<[^>]*>/g, "").slice(0, 100) + "..."}
                          </p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{post.createdBy?.name || ""}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Link href="/posts">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Xem tất cả bài viết
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Sự kiện sắp tới</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Chưa có sự kiện nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event) => (
                      <Link
                        key={event._id}
                        href={`/events/${event._id}`}
                        className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                      >
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(event.startDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Link href="/events">
                    <Button
                      variant="outline"
                      className="w-full bg-white/50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      Xem tất cả sự kiện
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Subscription */}
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Mail className="w-8 h-8 mx-auto mb-3 opacity-90" />
                  <h3 className="text-lg font-bold mb-2">Đăng ký nhận tin</h3>
                  <p className="text-blue-100 text-sm">
                    Nhận thông báo về các sự kiện và bài viết mới nhất từ Văn Lang Tech Club
                  </p>
                </div>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Email của bạn"
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-100 focus:bg-white/30 focus:border-white/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                  >
                    Đăng ký ngay
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Email</p>
                    <a
                      href="mailto:k.cntt-itclub@vanlanguni.vn"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      k.cntt-itclub@vanlanguni.vn
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Điện thoại</p>
                    <a href="tel:02871099221" className="text-sm text-green-600 dark:text-green-400 hover:underline">
                      028.7109 9221
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Địa chỉ</p>
                    <a
                      href="https://maps.google.com/?q=69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
