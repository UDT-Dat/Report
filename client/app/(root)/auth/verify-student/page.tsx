'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, GraduationCap, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { courseOptions } from '@/lib/constant';
import { useSearchParams } from 'next/navigation';

// Validation schema
const verifyStudentSchema = z.object({
	studentCode: z
		.string()
		.min(1, 'Mã sinh viên là bắt buộc')
		.min(6, 'Mã sinh viên phải có ít nhất 6 ký tự')
		.max(20, 'Mã sinh viên không được quá 20 ký tự')
		.regex(/^[A-Za-z0-9]+$/, 'Mã sinh viên chỉ được chứa chữ cái và số'),
	course: z.string().min(1, 'Vui lòng chọn khóa học'),
	studentCard: z
		.instanceof(File, { message: 'Vui lòng chọn file thẻ sinh viên' })
		.refine((file) => file.size <= 5 * 1024 * 1024, 'File không được vượt quá 5MB')
		.refine(
			(file) => ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type),
			'Chỉ chấp nhận file JPG, PNG hoặc PDF'
		),
});

type VerifyStudentFormValues = z.infer<typeof verifyStudentSchema>;

// Course options


export default function VerifyStudentPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [studentCardFile, setStudentCardFile] = useState<File | null>(null);
	const { toast } = useToast();

	// http://localhost:3001/auth/verify-student?userId=68486b87ccd98a0761167750
	const query = useSearchParams();
	const userId = query.get('userId') ?? '';

	const form = useForm<VerifyStudentFormValues>({
		resolver: zodResolver(verifyStudentSchema),
		defaultValues: {
			studentCode: '',
			course: '',
		},
	});

	const handleStudentCardChange = (files: FileList | null) => {
		if (files && files.length > 0) {
			const file = files[0];
			setStudentCardFile(file);
			form.setValue('studentCard', file);
			form.clearErrors('studentCard');
		}
	};

	const removeStudentCard = (index: number) => {
		setStudentCardFile(null);
		form.setValue('studentCard', undefined as any);
	};

	const onSubmit = async (values: VerifyStudentFormValues) => {
		setIsSubmitting(true);

		try {
			// Create FormData for file upload
			const formData = new FormData();
			formData.append('userId', userId ?? '');
			formData.append('studentCode', values.studentCode);
			formData.append('course', values.course);
			formData.append('studentCard', values.studentCard);

			// Simulate API call
			await fetchApi(
				'/auth/verify-student',
				{
					method: 'POST',
					body: formData,
				}
			);

			toast({
				title: 'Gửi yêu cầu thành công',
				description:
					'Yêu cầu xác thực sinh viên đã được gửi. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.',
			});
		} catch {
			toast({
				title: 'Lỗi',
				description: 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<div className="rounded-full bg-primary/10 p-3">
							<GraduationCap className="h-8 w-8 text-primary" />
						</div>
					</div>
					<h1 className="text-3xl font-bold mb-2">Xác thực Sinh viên</h1>
					<p className="text-muted-foreground">
						Vui lòng cung cấp thông tin để xác thực tư cách sinh viên của bạn
					</p>
				</div>

				<Card className="border-border/40 shadow-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Thông tin xác thực
						</CardTitle>
						<CardDescription>
							Điền đầy đủ thông tin bên dưới. Quá trình xem xét sẽ diễn ra trong vòng 24-48 giờ.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								{/* Student Code */}
								<FormField
									control={form.control}
									name="studentCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mã sinh viên</FormLabel>
											<FormControl>
												<Input
													placeholder="Ví dụ: SV123456"
													{...field}
													className="uppercase"
													onChange={(e) => field.onChange(e.target.value.toUpperCase())}
												/>
											</FormControl>
											<FormDescription>Nhập mã sinh viên được cấp bởi trường</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Course */}
								<FormField
									control={form.control}
									name="course"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Khóa học</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Chọn khóa học của bạn" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{courseOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormDescription>Chọn khóa học bạn đang theo học</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* File Upload */}
								<FormItem>
									<FileUpload
										label="Thẻ sinh viên *"
										accept="image/jpeg,image/jpg,image/png,application/pdf"
										onFileChange={handleStudentCardChange}
										error={form.formState.errors.studentCard?.message}
										files={studentCardFile ? [studentCardFile] : undefined}
										onRemoveFile={removeStudentCard}
										showImagePreview={true}
									/>
									<FormDescription>
										Tải lên ảnh chụp thẻ sinh viên hoặc file PDF thẻ sinh viên (tối đa 5MB)
									</FormDescription>
									<FormMessage />
								</FormItem>

								{/* Info Alert */}
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										<strong>Lưu ý:</strong> Thông tin bạn cung cấp sẽ được bảo mật và chỉ sử dụng
										cho mục đích xác thực. Quá trình xem xét có thể mất 24-48 giờ làm việc.
									</AlertDescription>
								</Alert>

								{/* Submit Button */}
								<div className="flex gap-4 pt-4">
									<Button type="submit" disabled={isSubmitting} className="flex-1">
										{isSubmitting ? (
											<>
												<span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
												Đang gửi...
											</>
										) : (
											<>
												<CheckCircle className="mr-2 h-4 w-4" />
												Gửi yêu cầu xác thực
											</>
										)}
									</Button>
									<Button type="button" variant="outline" asChild>
										<Link href="/">Quay lại trang chủ</Link>
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>

				<p className="text-center text-xs text-muted-foreground mt-6">
					Cần hỗ trợ? Liên hệ{' '}
					<Link href="/contact" className="text-primary hover:underline">
						bộ phận hỗ trợ
					</Link>
				</p>
			</div>
		</div>
	);
}
