"use client"

import {
  Calendar,
  FileText,
  Library,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useStats } from '@/hooks/useStats';

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useStats()

  const formatRatio = (ratio: string) => {
    const isPositive = ratio.startsWith('+')
    const isNegative = ratio.startsWith('-')
    
    return (
      <span className={`font-medium ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
      }`}>
        {ratio}
      </span>
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Vài phút trước'
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} ngày trước`
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Lỗi tải dữ liệu</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Quản Trị</h1>
        <p className="text-gray-500">Xem tổng quan và quản lý hệ thống CLB IT VLU</p>
        {!loading && data && (
          <button
            onClick={refetch}
            className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            🔄 Cập nhật dữ liệu
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Tổng người dùng */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Người dùng</p>
                {loading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold">{data?.monthlyStats.User.currentMonth || 0}</h3>
                    <p className="text-sm text-gray-400">Tổng: {data?.monthlyStats.User.total || 0}</p>
                  </div>
                )}
              </div>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <>
                  {formatRatio(data?.monthlyStats.User.ratio || '0%')}
                  <span className="ml-1 text-gray-500">so với tháng trước</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bài viết */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bài viết</p>
                {loading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold">{data?.monthlyStats.Post.currentMonth || 0}</h3>
                    <p className="text-sm text-gray-400">Tổng: {data?.monthlyStats.Post.total || 0}</p>
                  </div>
                )}
              </div>
              <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <>
                  {formatRatio(data?.monthlyStats.Post.ratio || '0%')}
                  <span className="ml-1 text-gray-500">so với tháng trước</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sự kiện */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sự kiện</p>
                {loading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold">{data?.monthlyStats.Event.currentMonth || 0}</h3>
                    <p className="text-sm text-gray-400">Tổng: {data?.monthlyStats.Event.total || 0}</p>
                  </div>
                )}
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <>
                  {formatRatio(data?.monthlyStats.Event.ratio || '0%')}
                  <span className="ml-1 text-gray-500">so với tháng trước</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Thư viện */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Thư viện</p>
                {loading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold">{data?.monthlyStats.Library.currentMonth || 0}</h3>
                    <p className="text-sm text-gray-400">Tổng: {data?.monthlyStats.Library.total || 0}</p>
                  </div>
                )}
              </div>
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <Library className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <>
                  {formatRatio(data?.monthlyStats.Library.ratio || '0%')}
                  <span className="ml-1 text-gray-500">so với tháng trước</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Người dùng mới</TabsTrigger>
            <TabsTrigger value="posts">Bài viết mới</TabsTrigger>
            <TabsTrigger value="events">Sự kiện mới</TabsTrigger>
            <TabsTrigger value="permissions">Quyền truy cập</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  ) : (
                    data?.recentRecords.users.map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status === 'active' ? 'Hoạt động' : user.status === 'pending' ? 'Chờ xác thực' : 'Không hoạt động'}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatTimeAgo(user.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="posts" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-4 w-40 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  ) : (
                    data?.recentRecords.posts.map((post) => (
                      <div key={post._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-500">Bởi: {post.createdBy?.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Bài viết mới</Badge>
                          <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-4 w-40 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  ) : (
                    data?.recentRecords.events.map((event) => (
                      <div key={event._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">Địa điểm: {event.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">Sự kiện mới</Badge>
                          <span className="text-sm text-gray-500">{formatTimeAgo(event.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                          <div className="ml-4">
                            <Skeleton className="h-4 w-40 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  ) : (
                    data?.recentRecords.permissions.map((permission) => (
                      <div key={permission._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* Avatar stack - người được duyệt và người duyệt */}
                          <div className="flex -space-x-2">
                            {/* Avatar người được duyệt */}
                            <div 
                              className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white z-10"
                              title={`Người được cấp quyền: ${permission.user?.name}`}
                            >
                              {permission.user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            {/* Avatar người duyệt */}
                            <div 
                              className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white"
                              title={`Người cấp quyền: ${permission.grantedBy?.name}`}
                            >
                              {permission.grantedBy?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium">Cấp quyền: {permission.library?.title}</p>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <span className="text-green-600">Cho: {permission.user?.name}</span>
                              <span>•</span>
                              <span className="text-purple-600">Bởi: {permission.grantedBy?.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">Quyền mới</Badge>
                          <span className="text-sm text-gray-500">{formatTimeAgo(permission.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
