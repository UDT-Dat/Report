'use client'

import { useState } from 'react';

import {
  ArrowLeft,
  Library,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { zodResolver } from '@hookform/resolvers/zod';

const createLibrarySchema = z.object({
	title: z.string()
		.min(1, 'Tiêu đề là bắt buộc')
		.max(100, 'Tiêu đề không được quá 100 ký tự'),
	description: z.string()
		.min(1, 'Mô tả là bắt buộc')
		.max(500, 'Mô tả không được quá 500 ký tự')
})

type CreateLibraryFormValues = z.infer<typeof createLibrarySchema>

export default function CreateLibraryPage() {
	const router = useRouter()
	const { toast } = useToast()
	const { tokens } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<CreateLibraryFormValues>({
		resolver: zodResolver(createLibrarySchema),
		defaultValues: {
			title: '',
			description: ''
		}
	})

	const onSubmit = async (values: CreateLibraryFormValues) => {
		setIsSubmitting(true)
		
		try {
			const response = await fetchApi('/library', {
				method: 'POST',
				body: JSON.stringify(values)
			}, tokens)

			if (response.status === 201) {
				toast({
					title: 'Thành công',
					description: 'Thư viện đã được tạo thành công',
				})
				router.push('/dashboard/bod/libraries')
			} else {
				toast({
					title: 'Lỗi',
					description: response.message || 'Không thể tạo thư viện',
					variant: 'destructive'
				})
			}
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Đã có lỗi xảy ra khi tạo thư viện',
				variant: 'destructive'
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleBack = () => {
		router.push('/dashboard/bod/libraries')
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<Button
					variant="outline"
					size="sm"
					onClick={handleBack}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại
				</Button>
				<div className="flex items-center gap-2">
					<Library className="h-6 w-6 text-blue-600" />
					<h1 className="text-2xl font-bold text-gray-900">Tạo thư viện mới</h1>
				</div>
			</div>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Library className="h-5 w-5 text-blue-600" />
						Thông tin thư viện
					</CardTitle>
					<CardDescription>
						Điền thông tin cơ bản để tạo thư viện mới. Bạn có thể thêm tài liệu và quản lý quyền truy cập sau khi tạo thành công.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base font-semibold">
											Tiêu đề thư viện *
										</FormLabel>
										<FormControl>
											<Input 
												placeholder="Ví dụ: Tài liệu lập trình web, Sách kỹ thuật, v.v..."
												className="text-base"
												{...field} 
											/>
										</FormControl>
										<FormDescription>
											Tên hiển thị của thư viện sẽ xuất hiện trong danh sách và kết quả tìm kiếm (tối đa 100 ký tự)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base font-semibold">
											Mô tả chi tiết *
										</FormLabel>
										<FormControl>
											<Textarea 
												placeholder="Mô tả về mục đích, nội dung chính của thư viện, đối tượng sử dụng..."
												className="min-h-[120px] text-base resize-none"
												{...field} 
											/>
										</FormControl>
										<FormDescription>
											Mô tả chi tiết giúp người dùng hiểu rõ hơn về nội dung và mục đích của thư viện (tối đa 500 ký tự)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Action Buttons */}
							<div className="flex justify-end space-x-4 pt-6 border-t">
								<Button 
									type="button" 
									variant="outline"
									onClick={handleBack}
									disabled={isSubmitting}
								>
									Hủy
								</Button>
								<Button 
									type="submit" 
									disabled={isSubmitting}
									className="flex items-center gap-2"
								>
									{isSubmitting ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											Đang tạo...
										</>
									) : (
										<>
											<Save className="h-4 w-4" />
											Tạo thư viện
										</>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Help Section */}
			<Card className="mt-6 bg-blue-50 border-blue-200">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<div className="bg-blue-100 rounded-full p-2">
							<Library className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-semibold text-blue-900 mb-2">Gợi ý tạo thư viện hiệu quả</h3>
							<ul className="text-sm text-blue-800 space-y-1">
								<li>• Đặt tên thư viện ngắn gọn, dễ nhớ và phản ánh đúng nội dung</li>
								<li>• Mô tả rõ ràng mục đích và phạm vi nội dung của thư viện</li>
								<li>• Có thể tham khảo các từ khóa phổ biến để người dùng dễ tìm kiếm</li>
								<li>• Sau khi tạo, bạn có thể upload tài liệu và phân quyền truy cập cho từng thành viên</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 