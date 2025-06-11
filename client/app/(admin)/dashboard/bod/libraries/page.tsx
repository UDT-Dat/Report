"use client"

import { useEffect, useState } from "react"

import { Calendar, Edit, Library, Plus, Trash2, User, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import PaginationClient from "@/components/pagination/PaginationClient"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { fetchApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import type { LibraryItem } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"

const libraryFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(100, "Tiêu đề không được quá 100 ký tự"),
  description: z.string().min(1, "Mô tả là bắt buộc").max(500, "Mô tả không được quá 500 ký tự"),
})

type LibraryFormValues = z.infer<typeof libraryFormSchema>

export default function LibrariesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { tokens } = useAuth()
  const [libraries, setLibraries] = useState<LibraryItem[]>([])
  const [total, setTotal] = useState(0)
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
  })

  const form = useForm<LibraryFormValues>({
    resolver: zodResolver(libraryFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  // Fetch libraries
  const fetchLibraries = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: filter.page.toString(),
        limit: filter.limit.toString(),
      })
      const response = await fetchApi(`/library?${queryParams.toString()}`, {}, tokens)
      if (response.status === 200) {
        setLibraries(response.result.libraries)
        setTotal(response.result.pagination.total)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thư viện",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (tokens?.accessToken) {
      fetchLibraries().finally(() => {
        setLoading(false)
      })
    }
  }, [tokens, filter.page])

  const handleCreateLibrary = () => {
    router.push("/dashboard/bod/libraries/create")
  }

  const handleEditLibrary = (library: LibraryItem) => {
    setSelectedLibrary(library)
    form.reset({
      title: library.title,
      description: library.description,
    })
    setIsEditSheetOpen(true)
  }

  const handleDeleteLibrary = async (library: LibraryItem) => {
    try {
      const response = await fetchApi(
        `/library/${library._id}`,
        {
          method: "DELETE",
        },
        tokens,
      )

      if (response.status === 200) {
        toast({
          title: "Thành công",
          description: "Đã xóa thư viện thành công",
        })
        fetchLibraries()
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xóa thư viện",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi xóa thư viện",
        variant: "destructive",
      })
    }
  }

  const onEditSubmit = async (values: LibraryFormValues) => {
    if (!selectedLibrary) return

    try {
      const response = await fetchApi(
        `/library/${selectedLibrary._id}`,
        {
          method: "PUT",
          body: JSON.stringify(values),
        },
        tokens,
      )

      if (response.status === 200) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật thư viện thành công",
        })
        setIsEditSheetOpen(false)
        fetchLibraries()
        form.reset()
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật thư viện",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi cập nhật thư viện",
        variant: "destructive",
      })
    }
  }

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex gap-1 ml-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const EmptyState = () => (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Library className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="mb-2">Chưa có thư viện nào</CardTitle>
        <CardDescription className="mb-6 max-w-sm">
          Bắt đầu bằng cách tạo thư viện đầu tiên của bạn để quản lý tài liệu và người dùng.
        </CardDescription>
        <Button onClick={handleCreateLibrary} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo thư viện mới
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Thư viện</h1>
          <p className="text-muted-foreground">Quản lý thư viện và quyền truy cập của người dùng</p>
        </div>
        <Button onClick={handleCreateLibrary} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Tạo thư viện mới
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : libraries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {libraries.map((library) => (
            <Card
              key={library._id}
              className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight line-clamp-2">{library.title}</CardTitle>
                    <CardDescription className="line-clamp-3 text-sm">{library.description}</CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLibrary(library)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa thư viện</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa thư viện "{library.title}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteLibrary(library)}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Creator Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${library.createdBy?.avatar}`}
                        alt={library.createdBy?.name || ""}
                      />
                      <AvatarFallback className="text-xs">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/profile/${library.createdBy?._id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors truncate"
                    >
                      {library.createdBy?.name || "Unknown"}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">{new Date(library.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => router.push(`/dashboard/bod/libraries/${library._id}`)}
                  variant="secondary"
                  className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Quản lý người dùng
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Edit Library Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="space-y-3">
            <SheetTitle className="text-xl">Chỉnh sửa thư viện</SheetTitle>
            <SheetDescription>Cập nhật thông tin thư viện. Nhấn "Lưu thay đổi" khi hoàn tất.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề thư viện</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tiêu đề thư viện..."
                          {...field}
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormDescription>Tên hiển thị của thư viện (tối đa 100 ký tự)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả về thư viện..."
                          className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Mô tả chi tiết về mục đích và nội dung của thư viện (tối đa 500 ký tự)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Pagination */}
      {total > filter.limit && (
        <div className="flex justify-center pt-8">
          <PaginationClient total={total} filter={filter} setFilter={setFilter} />
        </div>
      )}
    </div>
  )
}
