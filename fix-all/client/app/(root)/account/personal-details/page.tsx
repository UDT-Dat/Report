"use client"

import type React from "react"
import { useEffect } from "react"

import { Camera, Sparkles } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { fetchApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import type { UserRole } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/components/ui/badge"
import { parseImageUrl } from "@/lib/parseImageUrl"

// Zod schema for personal information validation
const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Tên phải có ít nhất 2 ký tự" })
    .max(50, { message: "Tên không được quá 50 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, { message: "Số điện thoại không hợp lệ" })
    .min(10, { message: "Số điện thoại phải có ít nhất 10 ký tự" }),
  address: z
    .string()
    .min(5, { message: "Địa chỉ phải có ít nhất 5 ký tự" })
    .max(200, { message: "Địa chỉ không được quá 200 ký tự" }),
  studentCode: z.string().optional(),
  course: z.string().optional(),
})

// Zod schema for password change validation
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
    newPassword: z
      .string()
      .min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  })

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

export default function PersonalDetails() {
  const { toast } = useToast()
  // Get current user from auth provider
  const { user: currentUser, tokens, update, logout } = useAuth()

  // Initialize form with current user data (hooks must be called before any returns)
  const personalInfoForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.phone ?? "",
      address: currentUser?.address ?? "",
      studentCode: currentUser?.studentCode ?? "",
      course: currentUser?.course ?? "",
    },
  })

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Update form when currentUser changes
  useEffect(() => {
    personalInfoForm.reset({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      studentCode: currentUser?.studentCode || "",
      course: currentUser?.course || "",
    })
  }, [currentUser, personalInfoForm])

  // Early return AFTER all hooks are called
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Đang tải thông tin</h2>
          <p className="text-gray-600 dark:text-gray-400">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    )
  }

  const handlePersonalInfoSubmit = async (data: PersonalInfoFormData) => {
    delete data.studentCode;
    delete data.course;

    const response = await fetchApi(
      "/users/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      {
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      },
    )
    if (response.status === 200) {
      update({ ...currentUser, ...data })
      toast({
        title: "Cập nhật thông tin cá nhân thành công",
        description: "Thông tin cá nhân đã được cập nhật thành công",
        variant: "success",
      })
    } else {
      toast({
        title: "Có lỗi xảy ra khi cập nhật thông tin cá nhân",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      })
    }
  }

  const handlePasswordSubmit = async (data: PasswordChangeFormData) => {
    const response = await fetchApi(
      "/users/update/password",
      {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      },
      {
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      },
    )
    if (response.status === 200) {
      toast({
        title: "Mật khẩu đã được cập nhật thành công",
        description: "Mật khẩu đã được cập nhật thành công",
        variant: "success",
      })
    } else {
      toast({
        title: "Có lỗi xảy ra khi cập nhật mật khẩu",
        description: response.result.message ?? "Vui lòng thử lại sau",
        variant: "destructive",
      })
    }
  }
  const handleAvatarSubmit = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)
    const response = await fetchApi(
      "/users/avatar",
      {
        method: "PUT",
        body: formData,
      },
      {
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      },
    )
    if (response.status === 200) {
      update({
        ...currentUser,
        ...(type === "avatar" ? { avatar: response.result.avatar } : { coverImage: response.result.coverImage }),
      })
      toast({
        title: "Cập nhật ảnh đại diện thành công",
        description: "Ảnh đại diện đã được cập nhật thành công",
        variant: "success",
      })
    } else {
      toast({
        title: "Có lỗi xảy ra khi cập nhật cover image",
        description: response.result.message || "Vui lòng thử lại sau",
        variant: "destructive",
      })
    }
  }

  const getRoleText = (role?: UserRole) => {
    if (!role) return "Chưa xác định"

    switch (role) {
      case "admin":
        return "Quản trị viên"
      case "bod":
        return "Ban điều hành"
      case "member":
        return "Thành viên"
      default:
        return "Không xác định"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có thông tin"

    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Ngày không hợp lệ"
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

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Cập nhật thông tin cá nhân của bạn</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  Ảnh đại diện
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-6">
                  <Avatar className="h-32 w-32 shadow-lg ring-4 ring-white/50 dark:ring-gray-700/50">
                    <AvatarImage
                      src={parseImageUrl(currentUser?.avatar)}
                      className="object-cover"
                      alt="Avatar"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl font-bold">
                      {currentUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor="avatar"
                    className="absolute bottom-0 right-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      name="avatar"
                      id="avatar"
                      hidden
                      onChange={(e) => handleAvatarSubmit(e, "avatar")}
                    />
                  </Label>
                </div>
                <div className="space-y-3 text-center">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">{currentUser?.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    ID: {currentUser?._id}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      {getRoleText(currentUser?.role)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Ảnh bìa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                  <img
                    src={parseImageUrl(currentUser?.coverImage)}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100 rounded-xl">
                    <Label
                      htmlFor="coverImage"
                      className="absolute inset-0 rounded-xl flex items-center justify-center cursor-pointer"
                    >
                      <div className="flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-xl px-4 py-2 shadow-lg backdrop-blur-sm">
                        <Camera className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Thay đổi ảnh bìa</span>
                      </div>
                      <input
                        type="file"
                        name="coverImage"
                        id="coverImage"
                        hidden
                        onChange={(e) => handleAvatarSubmit(e, "coverImage")}
                      />
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <TabsTrigger
                  value="personal"
                  className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                >
                  Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                >
                  Tài khoản
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...personalInfoForm}>
                      <form onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={personalInfoForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Họ và tên *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={personalInfoForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Email *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    className="h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={personalInfoForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Số điện thoại *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={personalInfoForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Địa chỉ *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={personalInfoForm.control}
                            name="studentCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Mã sinh viên *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled
                                    className="h-12 bg-gray-100 dark:bg-gray-600/50 border-gray-200 dark:border-gray-600 rounded-xl"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={personalInfoForm.control}
                            name="course"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Khóa học *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled
                                    className="h-12 bg-gray-100 dark:bg-gray-600/50 border-gray-200 dark:border-gray-600 rounded-xl"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            variant="outline"
                            type="button"
                            className="h-12 px-6 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
                          >
                            Hủy
                          </Button>
                          <Button
                            type="submit"
                            className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            disabled={personalInfoForm.formState.isSubmitting}
                          >
                            {personalInfoForm.formState.isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Đang lưu...
                              </div>
                            ) : (
                              "Lưu thay đổi"
                            )}
                          </Button>
                        </div>
                      </form>

                      {/* Read-only User Information */}
                      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Thông tin tài khoản</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">ID tài khoản</Label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border">
                              {currentUser?._id}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Vai trò</Label>
                            <div className="flex">
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                {getRoleText(currentUser?.role)}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ngày tạo</Label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border">
                              {formatDate(currentUser?.createdAt)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Cập nhật lần cuối
                            </Label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border">
                              {formatDate(currentUser?.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      Thông tin tài khoản
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mật khẩu hiện tại *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                  className="h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Mật khẩu mới *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Xác nhận mật khẩu *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            variant="outline"
                            type="button"
                            className="h-12 px-6 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
                          >
                            Hủy
                          </Button>
                          <Button
                            type="submit"
                            className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            disabled={passwordForm.formState.isSubmitting}
                          >
                            {passwordForm.formState.isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Đang cập nhật...
                              </div>
                            ) : (
                              "Cập nhật mật khẩu"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
