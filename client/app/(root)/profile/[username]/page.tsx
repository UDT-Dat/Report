"use client"
import { use, useEffect, useState } from "react"

import { Calendar, Edit, FileText, Heart, MapPin, MessageCircle, User, UserIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import PaginationClient from "@/components/pagination/PaginationClient"
import { ProfilePostsSkeleton, ProfileSkeleton } from "@/components/profile-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRole } from "@/constants"
import { fetchApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { parseImageUrl } from "@/lib/parseImageUrl"
import type { Event, Post, User as UserType } from "@/lib/types"
import { formatDate } from "@/lib/utils"

export default function ProfilePage({ params }: Readonly<{ params: Promise<{ username: string }> }>) {
  const { username } = use(params)
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalEvents, setTotalEvents] = useState(0)
  const [activeTab, setActiveTab] = useState("posts")
  const [filter, setFilter] = useState<{
    page: number
    limit: number
  }>({
    page: 1,
    limit: 6,
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")

	const isOwnProfile = username === "me" || user?._id === currentUser?._id

	const { tokens } = useAuth();

  const fetchEvents = async () => {
    if (username === "me" && !currentUser?._id) {
      setEventsLoading(true)
      return
    }

    const query = new URLSearchParams()
    const userId = username === "me" ? (currentUser?._id as string) : username
    query.set("page", filter.page.toString())
    query.set("limit", filter.limit.toString())

    try {
      const response = await fetchApi(`/events/${userId}/joined-events?${query.toString()}`, {})
      if (response.status === 200) {
        setEvents(response.result.events ?? [])
        setTotalEvents(response.result.pagination?.total ?? 0)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
    }
  }

  const fetchPosts = async () => {
    if (!currentUser?._id && username === "me") {
      setPostsLoading(true)
      return
    }
    const query = new URLSearchParams()
    query.set("createdBy", username === "me" ? (currentUser?._id as string) : username)
    query.set("page", filter.page.toString())
    query.set("limit", filter.limit.toString())

    // Add status filter only for own profile
    if (isOwnProfile && statusFilter !== "all") {
      query.set("status", statusFilter)
    }

    const response = await fetchApi(`/posts?${query.toString()}`, {
      method: "GET",
		},tokens
		)
    if (response.status === 200) {
      setPosts(response.result.posts)
      setTotalPosts(response.result.pagination?.total ?? 0)
    }
  }

  const fetchUser = async () => {
    if (username === "me") {
      if (currentUser) {
        setUser(currentUser)
        setIsLoading(false)
      }
    } else {
      fetchApi(
        `/users/${username}`,
        {
          method: "GET",
        },
        {
          accessToken: undefined,
          refreshToken: undefined,
        },
      ).then((res) => {
        if (res.result) {
          setUser(res.result)
        }
      })
    }
  }

  useEffect(() => {
    Promise.all([fetchUser(), fetchPosts(), fetchEvents()]).then(() => {
      setIsLoading(false)
      setPostsLoading(false)
      setEventsLoading(false)
    })
  }, [username, currentUser, filter, statusFilter])

  useEffect(() => {
    if (currentUser && username === "me") {
      setIsLoading(false)
    }
  }, [currentUser, username])

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Không tìm thấy người dùng</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Người dùng này không tồn tại hoặc đã bị xóa</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            >
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRoleText = (role?: string) => {
    if (!role) return "Thành viên"

    switch (role) {
      case UserRole.ADMIN:
        return "Quản trị viên"
      case UserRole.BOD:
        return "Ban điều hành"
      case UserRole.MEMBER:
        return "Thành viên"
      default:
        return "Thành viên"
    }
  }

  const getRoleBadgeClass = (role?: string) => {
    if (!role) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"

    switch (role) {
      case UserRole.ADMIN:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case UserRole.BOD:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      case UserRole.MEMBER:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Chờ duyệt</Badge>
        )
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Đã duyệt</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Bị từ chối</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Cover Image */}
      <div className="relative h-56 w-full md:h-72 lg:h-80">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10"></div>
        <Image
          src={parseImageUrl(user.coverImage) ?? "/placeholder.svg"}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative">
        {/* Profile Header */}
        <div className="relative -mt-24 mb-8 z-20">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-700 shadow-lg">
                  <AvatarImage src={parseImageUrl(user.avatar) ?? "/placeholder.svg"} alt={user.name ?? "User"} />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    {user.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Link href="/account/personal-details" className="absolute bottom-0 right-0">
                    <Button size="icon" className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 shadow-md">
                      <Edit className="h-4 w-4 text-white" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  {isOwnProfile && (
                    <Link href="/account/personal-details">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa hồ sơ
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Badge className={`px-3 py-1 ${getRoleBadgeClass(user.role)}`}>{getRoleText(user.role)}</Badge>

                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span>{user.address ?? "Không có địa chỉ"}</span>
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span>Tham gia {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPosts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bài viết</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalEvents}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sự kiện</p>
                  </div>
                  {/* <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
										<p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">Người theo dõi</p>
									</div>
									<div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-center">
										<p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">0</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">Đang theo dõi</p>
									</div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger
              value="posts"
              className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              Bài viết
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              Sự kiện
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              Giới thiệu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {isOwnProfile && (
              <div className="mb-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className={
                          statusFilter === "all" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" : ""
                        }
                      >
                        Tất cả
                      </Button>
                      <Button
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("pending")}
                        className={
                          statusFilter === "pending" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : ""
                        }
                      >
                        Chờ duyệt
                      </Button>
                      <Button
                        variant={statusFilter === "approved" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("approved")}
                        className={
                          statusFilter === "approved" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : ""
                        }
                      >
                        Đã duyệt
                      </Button>
                      <Button
                        variant={statusFilter === "rejected" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("rejected")}
                        className={
                          statusFilter === "rejected" ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" : ""
                        }
                      >
                        Bị từ chối
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {postsLoading ? (
              <ProfilePostsSkeleton />
            ) : (
              <>
                {posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post, i) => (
                      <Card
                        key={i}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <CardContent className="p-0">
                          {post.bannerImage && (
                            <div className="relative w-full h-48 overflow-hidden">
                              <Image
                                src={parseImageUrl(post.bannerImage) ?? "/placeholder.svg"}
                                alt="Post image"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                          )}
                          <div className="p-5">
                            <Link href={`/posts/${post._id}`} className="block group">
                              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {post.title}
                              </h3>
                              <div
                                className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: post.content.replace(/<[^>]*>/g, ""),
                                }}
                              />
                            </Link>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1" />
                                  <span>{post.likes ?? 0}</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  <span>{post.comments ?? 0}</span>
                                </div>
                                {isOwnProfile && getStatusBadge(post.status)}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-xs">
                                {formatDate(post.createdAt)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Chưa có bài viết nào
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile
                          ? "Bạn chưa đăng bài viết nào. Hãy bắt đầu chia sẻ kiến thức và trải nghiệm của mình!"
                          : "Người dùng này chưa đăng bài viết nào."}
                      </p>
                      {isOwnProfile && (
                        <Button
                          className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          onClick={() => router.push("/editorv2")}
                        >
                          Tạo bài viết mới
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {posts.length > 0 && (
                  <PaginationClient total={totalPosts} filter={filter} setFilter={setFilter} className="mt-8" />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="events">
            {eventsLoading ? (
              <ProfilePostsSkeleton />
            ) : (
              <>
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event, i) => (
                      <Card
                        key={i}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <CardContent className="p-0">
                          {event.imageUrl && (
                            <div className="relative w-full h-48 overflow-hidden">
                              <Image
                                src={event.imageUrl ?? "/placeholder.svg"}
                                alt="Event image"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                          )}
                          <div className="p-5">
                            <Link href={`/events/${event._id}`} className="block group">
                              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {event.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 text-sm">
                                {event.description}
                              </p>
                            </Link>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <User className="h-4 w-4 mr-2" />
                                <span>
                                  {event.participants?.length ?? 0}/{event.maxParticipants} người tham gia
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge
                                className={`px-3 py-1 ${
                                  new Date(event.startDate) > new Date()
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : new Date(event.endDate) > new Date()
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                }`}
                              >
                                {new Date(event.startDate) > new Date()
                                  ? "Sắp diễn ra"
                                  : new Date(event.endDate) > new Date()
                                    ? "Đang diễn ra"
                                    : "Đã kết thúc"}
                              </Badge>
                              <div className="text-gray-500 dark:text-gray-400 text-xs">
                                {formatDate(event.createdAt)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Chưa có sự kiện nào
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile
                          ? "Bạn chưa tham gia sự kiện nào. Hãy khám phá các sự kiện sắp tới!"
                          : "Người dùng này chưa tham gia sự kiện nào."}
                      </p>
                      <Button
                        className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        onClick={() => router.push("/events")}
                      >
                        Khám phá sự kiện
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {events.length > 0 && totalEvents > filter.limit && (
                  <PaginationClient total={totalEvents} filter={filter} setFilter={setFilter} className="mt-8" />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Họ và tên</h4>
                    <p className="text-gray-800 dark:text-gray-100">{user.name ?? "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h4>
                    <p className="text-gray-800 dark:text-gray-100">{user.email ?? "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</h4>
                    <p className="text-gray-800 dark:text-gray-100">{user.phone ?? "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Địa chỉ</h4>
                    <p className="text-gray-800 dark:text-gray-100">{user.address ?? "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mã sinh viên</h4>
                    <p className="text-gray-800 dark:text-gray-100">{user.studentCode ?? "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Khóa học</h4>
                    <p className="text-gray-800 dark:text-gray-100">{user.course ?? "Chưa cập nhật"}</p>
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link href="/account/personal-details">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                        <Edit className="mr-2 h-4 w-4" />
                        Cập nhật thông tin cá nhân
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
