"use client"

import { useEffect, useState } from "react"

import PaginationClient from "@/components/pagination/PaginationClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { parseImageUrl } from "@/lib/parseImageUrl"
import { type Comment as CommentType, PostStatus, type Post as PostType } from "@/lib/types"
import { updateHtml } from "@/lib/utils"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Share2,
  Trash2,
  User,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileIcon as FilePdf,
  FileArchive,
  FileCode,
  ExternalLink,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"

interface LikeUser {
  _id: string
  post: string
  user: {
    _id: string
    name: string
    email: string
    role: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

// Add a helper function to determine file icon based on file type
// Add this function before the PostDetailPage component
const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase()

  if (!extension) return <File className="h-5 w-5" />

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"]
  const videoExts = ["mp4", "webm", "mov", "avi", "mkv"]
  const audioExts = ["mp3", "wav", "ogg", "flac"]
  const archiveExts = ["zip", "rar", "7z", "tar", "gz"]
  const codeExts = ["js", "ts", "jsx", "html", "css", "json", "py", "java", "c", "cpp"]

  if (imageExts.includes(extension)) return <FileImage className="h-5 w-5" />
  if (videoExts.includes(extension)) return <FileVideo className="h-5 w-5" />
  if (audioExts.includes(extension)) return <FileAudio className="h-5 w-5" />
  if (extension === "pdf") return <FilePdf className="h-5 w-5" />
  if (archiveExts.includes(extension)) return <FileArchive className="h-5 w-5" />
  if (codeExts.includes(extension)) return <FileCode className="h-5 w-5" />

  return <File className="h-5 w-5" />
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<PostType | null>(null)
  const [comments, setComments] = useState<CommentType[]>([])
  const [likes, setLikes] = useState<LikeUser[]>([])
  const [loading, setLoading] = useState(true)
  const { tokens } = useAuth()
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [likesLoading, setLikesLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [commentsTotal, setCommentsTotal] = useState(0)
  const [likesTotal, setLikesTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [commentsFilters, setCommentsFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  })
  const [likesFilters, setLikesFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  })

  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)

  // Fetch post details
  const fetchPost = async () => {
    try {
      setLoading(true)
      const postResponse = await fetchApi(
        `/posts/${postId}`,
        {
          method: "GET",
        },
        tokens,
      )
      if (postResponse.status === 200) {
        setPost(postResponse.result)
        setLikesTotal(postResponse.result.likes ?? 0)
        setCommentsTotal(postResponse.result.comments ?? 0)
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      toast.error("Không thể tải thông tin bài viết", {
        duration: 2000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch comments
  const fetchComments = async () => {
    try {
      setCommentsLoading(true)
      const commentsResponse = await fetchApi(
        `/comments?postId=${postId}`,
        {
          method: "GET",
        },
        tokens,
      )
      if (commentsResponse.status === 200) {
        setComments(commentsResponse.result.comments)
        setCommentsTotal(commentsResponse.result.pagination.total)
      }

      // Filter sample data
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast.error("Không thể tải danh sách bình luận", {
        duration: 2000,
      })
    } finally {
      setCommentsLoading(false)
    }
  }

  // Fetch likes
  const fetchLikes = async () => {
    try {
      setLikesLoading(true)
      const response = await fetchApi(
        `/likes/${postId}/getLikes`,
        {
          method: "GET",
        },
        tokens,
      )
      if (response.status === 200) {
        setLikes(response.result.likes)
        setLikesTotal(response.result.pagination.total)
      }
    } catch (error) {
      console.error("Error fetching likes:", error)
      toast.error("Không thể tải danh sách lượt thích", {
        duration: 2000,
      })
    } finally {
      setLikesLoading(false)
    }
  }

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  useEffect(() => {
    if (postId && activeTab === "comments") {
      console.log("Fetching comments for post:", postId)

      fetchComments()
    }
  }, [postId, commentsFilters, activeTab])

  useEffect(() => {
    if (postId && activeTab === "likes") {
      fetchLikes()
    }
  }, [postId, likesFilters, activeTab])

  // Get status badge
  const getStatusBadge = (status: PostStatus) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", variant: "secondary" },
      approved: { label: "Đã duyệt", variant: "success" },
      rejected: { label: "Từ chối", variant: "destructive" },
    }

    const config = statusConfig[status] || statusConfig.approved

    return (
      <Badge variant={config.variant as any} className="text-sm font-medium">
        {config.label}
      </Badge>
    )
  }

  // Format date
  const formatDateUtil = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Handle search for comments
  const handleCommentsSearch = useDebouncedCallback((value: string) => {
    setCommentsFilters((prev) => ({
      ...prev,
      page: 1,
      search: value,
    }))
  }, 500)

  // Handle search for likes
  const handleLikesSearch = useDebouncedCallback((value: string) => {
    setLikesFilters((prev) => ({
      ...prev,
      page: 1,
      search: value,
    }))
  }, 500)

  // Export comments to Excel
  const exportCommentsToExcel = async () => {
    try {
      setExportLoading(true)
      // TODO: Replace with actual API call
      // const response = await postService.exportPostComments(postId, commentsFilters, tokens)

      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Xuất dữ liệu thành công", {
        description: "Danh sách bình luận đã được xuất ra file Excel",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error exporting comments:", error)
      toast.error("Có lỗi xảy ra khi xuất dữ liệu", {
        duration: 3000,
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Share post
  const sharePost = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title,
          text: post?.title,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error))
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Đã sao chép liên kết bài viết", {
        duration: 2000,
      })
    }
  }

  // Handle approve post
  const handleApprovePost = async () => {
    try {
      setActionLoading(true)

      await fetchApi(
        `/posts/${postId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status: PostStatus.Approved }),
        },
        tokens,
      )

      // Update local state
      setPost((prev) => (prev ? { ...prev, status: PostStatus.Approved } : null))

      toast.success("Duyệt bài viết thành công!", {
        duration: 2000,
      })

      setActionDialogOpen(false)
      setActionType(null)
    } catch (error) {
      console.error("Error approving post:", error)
      toast.error("Không thể duyệt bài viết", {
        duration: 2000,
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle reject post
  const handleRejectPost = async () => {
    try {
      setActionLoading(true)

      await fetchApi(
        `/posts/${postId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status: PostStatus.Rejected }),
        },
        tokens,
      )

      // Update local state
      setPost((prev) => (prev ? { ...prev, status: PostStatus.Rejected } : null))

      toast.success("Từ chối bài viết thành công!", {
        duration: 2000,
      })

      setActionDialogOpen(false)
      setActionType(null)
    } catch (error) {
      console.error("Error rejecting post:", error)
      toast.error("Không thể từ chối bài viết", {
        duration: 2000,
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete post
  const handleDeletePost = async () => {
    try {
      setActionLoading(true)

      await fetchApi(
        `/posts/${postId}`,
        {
          method: "DELETE",
        },
        tokens,
      )

      toast.success("Xóa bài viết thành công!", {
        duration: 2000,
      })

      setDeleteDialogOpen(false)

      // Redirect to posts list after successful deletion
      router.push("/admin/dashboard/bod/posts")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Không thể xóa bài viết", {
        duration: 2000,
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Open action dialogs
  const openApproveDialog = () => {
    setActionType("approve")
    setActionDialogOpen(true)
  }

  const openRejectDialog = () => {
    setActionType("reject")
    setActionDialogOpen(true)
  }

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true)
  }

  // Confirm action
  const confirmAction = () => {
    if (actionType === "approve") {
      handleApprovePost()
    } else if (actionType === "reject") {
      handleRejectPost()
    }
  }

  // Check if user has admin permissions
  const hasAdminPermissions = () => {
    // TODO: Replace with actual role check from auth context
    // return user?.role === "admin" || user?.role === "bod"
    return true // For demo purposes
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center mb-4">
          <Button variant="ghost" disabled className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex flex-wrap gap-4 mt-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-8 w-24 mt-2" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Không tìm thấy bài viết</AlertTitle>
          <AlertDescription>
            Bài viết này không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang trước.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex gap-2">
          {/* Admin Actions - Only show for pending posts and admin users */}
          {getStatusBadge(post.status)}

          {/* Delete button - Show for all admin users */}
          {hasAdminPermissions() && (
            <Button
              variant="outline"
              size="sm"
              onClick={openDeleteDialog}
              disabled={actionLoading}
              className="gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xóa
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={sharePost} className="gap-2">
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
          {(activeTab === "comments" || activeTab === "likes") && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportCommentsToExcel}
              disabled={exportLoading}
              className="gap-2"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Xuất Excel
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Post Header Card */}
      <Card className="border-t-4 border-t-primary overflow-hidden">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-primary mr-3" />
              <div>
                <div className="text-sm font-medium">Ngày tạo</div>
                <div className="text-sm text-muted-foreground">{formatDateUtil(post.createdAt)}</div>
              </div>
            </div>

            <div className="flex items-center p-3 rounded-lg bg-muted/50">
              <Heart className="h-5 w-5 text-primary mr-3" />
              <div>
                <div className="text-sm font-medium">Lượt thích</div>
                <div className="text-sm text-muted-foreground">{post.likes} lượt thích</div>
              </div>
            </div>

            <div className="flex items-center p-3 rounded-lg bg-muted/50">
              <MessageCircle className="h-5 w-5 text-primary mr-3" />
              <div>
                <div className="text-sm font-medium">Bình luận</div>
                <div className="text-sm text-muted-foreground">{post.comments} bình luận</div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={parseImageUrl(post.createdBy.avatar) || "/placeholder.svg"} alt={post.createdBy.name} />
              <AvatarFallback>{post.createdBy.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm text-muted-foreground">Tác giả</div>
              <div className="font-medium">{post.createdBy.name}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:w-[500px]">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nội dung
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Bình luận ({commentsTotal})
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Lượt thích ({likesTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-6">
          {/* Banner Image */}
          {post.bannerImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Ảnh bìa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg">
                  <img
                    src={parseImageUrl(post.bannerImage) || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: updateHtml(post.content) }} />
              </div>
            </CardContent>
          </Card>

          {/* Add the attachments card here */}
          {post.attachments && post.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tệp đính kèm</CardTitle>
                <CardDescription>{post.attachments.length} tệp đính kèm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.attachments.map((attachment: any, index: number) => {
                    const fileName = attachment.originalname || attachment.name || `File ${index + 1}`
                    const fileUrl = parseImageUrl(attachment.path || attachment.url)

                    return (
                      <div
                        key={attachment._id || index}
                        className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="mr-3 p-2 bg-primary/10 rounded-md">{getFileIcon(fileName)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate" title={fileName}>
                            {fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : "Kích thước không xác định"}
                          </p>
                        </div>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 p-1.5 rounded-md hover:bg-muted"
                          title="Xem tệp"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a
                          href={fileUrl}
                          download={fileName}
                          className="ml-1 p-1.5 rounded-md hover:bg-muted"
                          title="Tải xuống"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Danh sách bình luận
                </CardTitle>
                <CardDescription>Tổng cộng {commentsTotal} bình luận</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm bình luận..."
                    className="pl-8 w-full md:w-64"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      handleCommentsSearch(e.target.value)
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Đang tải danh sách bình luận...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-1">
                    {commentsFilters.search ? "Không tìm thấy bình luận nào" : "Chưa có bình luận nào"}
                  </p>
                  <p className="text-sm">
                    {commentsFilters.search ? "Thử tìm kiếm với từ khóa khác" : "Bình luận sẽ xuất hiện ở đây"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={parseImageUrl(comment.createdBy.avatar) || "/placeholder.svg"}
                              alt={comment.createdBy.name}
                            />
                            <AvatarFallback>{comment.createdBy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.createdBy.name}</span>
                              <span className="text-xs text-muted-foreground">{formatDateUtil(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <PaginationClient
                      total={commentsTotal}
                      filter={{ page: commentsFilters.page, limit: commentsFilters.limit }}
                      setFilter={(newFilter) => setCommentsFilters((prev) => ({ ...prev, ...newFilter }))}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5" />
                  Danh sách lượt thích
                </CardTitle>
                <CardDescription>Tổng cộng {likesTotal} lượt thích</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm người thích..."
                    className="pl-8 w-full md:w-64"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      handleLikesSearch(e.target.value)
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {likesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Đang tải danh sách lượt thích...</span>
                </div>
              ) : likes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Heart className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-1">
                    {likesFilters.search ? "Không tìm thấy ai" : "Chưa có lượt thích nào"}
                  </p>
                  <p className="text-sm">
                    {likesFilters.search ? "Thử tìm kiếm với từ khóa khác" : "Lượt thích sẽ xuất hiện ở đây"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Tên</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead>Thời gian thích</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {likes.map((like) => {
                          let badgeVariant: "destructive" | "default" | "secondary"
                          let badgeLabel: string
                          if (like.user.role === "admin") {
                            badgeVariant = "destructive"
                            badgeLabel = "Quản trị viên"
                          } else if (like.user.role === "bod") {
                            badgeVariant = "default"
                            badgeLabel = "Ban chủ nhiệm"
                          } else {
                            badgeVariant = "secondary"
                            badgeLabel = "Thành viên"
                          }
                          return (
                            <TableRow key={like._id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage
                                      src={parseImageUrl(like.user.avatar) || "/placeholder.svg"}
                                      alt={like.user.name}
                                    />
                                    <AvatarFallback className="bg-primary/10">
                                      <User className="h-4 w-4 text-primary" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate max-w-[180px]">{like.user.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="truncate max-w-[180px]">{like.user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                              </TableCell>
                              <TableCell>{formatDateUtil(like.createdAt)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-6">
                    <PaginationClient
                      total={likesTotal}
                      filter={{ page: likesFilters.page, limit: likesFilters.limit }}
                      setFilter={(newFilter) => setLikesFilters((prev) => ({ ...prev, ...newFilter }))}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog (Approve/Reject) */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Xác nhận duyệt bài viết" : "Xác nhận từ chối bài viết"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {actionType === "approve" ? "duyệt" : "từ chối"} bài viết "{post?.title}"?
              {actionType === "reject" && " Bài viết sẽ không được hiển thị công khai."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={actionLoading}
              className={
                actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {actionType === "approve" ? "Đang duyệt..." : "Đang từ chối..."}
                </div>
              ) : actionType === "approve" ? (
                "Duyệt"
              ) : (
                "Từ chối"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết "{post?.title}"? Hành động này không thể hoàn tác và sẽ xóa tất cả bình
              luận, lượt thích liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xóa...
                </div>
              ) : (
                "Xóa bài viết"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
