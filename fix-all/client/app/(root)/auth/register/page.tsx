'use client';

import { Mail, User, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z
	.object({
		name: z.string().min(1, 'Họ và tên không được để trống'),
		email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
		password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
		confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Mật khẩu xác nhận không khớp',
		path: ['confirmPassword'],
	});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const { toast } = useToast();
	const router = useRouter();

	const form = useForm<RegisterValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (values: RegisterValues) => {
		const res = await fetchApi('/auth/register', {
			method: 'POST',
			body: JSON.stringify({
				name: values.name,
				email: values.email,
				password: values.password,
				confirmPassword: values.confirmPassword,
			}),
		});
		if (res.status === 201) {
			toast({
				title: 'Đăng ký thành công',
				description: 'Vui lòng đợi admin phê duyệt tài khoản của bạn',
				variant: 'success',
			});
			setTimeout(() => {
				router.push('/auth/verify-student?userId=' + encodeURIComponent(res.result.user.user_id));
			}, 1500);
		} else {
			toast({
				variant: 'destructive',
				title: 'Đăng ký thất bại',
				description: res.result.message ?? 'Có lỗi xảy ra khi đăng ký',
			});
		}
	};

	const handleGoogleLogin = () => {
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
	};

	const handleMicrosoftLogin = () => {
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/microsoft`;
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
			</div>

			<Card className="w-full max-w-md relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl dark:shadow-2xl dark:shadow-blue-500/10">
				<CardHeader className="space-y-4 text-center pb-6">
					<div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
						<UserPlus className="w-8 h-8 text-white" />
					</div>
					<CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
						Tạo tài khoản
					</CardTitle>
					<CardDescription className="text-gray-600 dark:text-gray-300 text-base">
						Tham gia cộng đồng IT VLU ngay hôm nay
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					<Form {...form}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Họ và tên
										</FormLabel>
										<FormControl>
											<div className="relative">
												<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
												<Input
													placeholder="Nhập họ và tên"
													{...field}
													autoComplete="name"
													className="pl-10 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 rounded-xl transition-all duration-200"
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-500 dark:text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Email
										</FormLabel>
										<FormControl>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
												<Input
													type="email"
													placeholder="email@example.com"
													{...field}
													autoComplete="email"
													className="pl-10 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 rounded-xl transition-all duration-200"
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-500 dark:text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Mật khẩu
										</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={'password'}
													placeholder="Nhập mật khẩu"
													{...field}
													autoComplete="new-password"
													className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 rounded-xl transition-all duration-200"
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-500 dark:text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Xác nhận mật khẩu
										</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={'password'}
													placeholder="Xác nhận mật khẩu"
													{...field}
													autoComplete="new-password"
													className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 rounded-xl transition-all duration-200"
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-500 dark:text-red-400" />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-500 dark:from-emerald-600 dark:to-blue-600 hover:from-emerald-600 hover:to-blue-600 dark:hover:from-emerald-700 dark:hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										Đang đăng ký...
									</div>
								) : (
									'Đăng ký'
								)}
							</Button>
						</form>
					</Form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-200 dark:border-gray-600" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-medium">
								Hoặc đăng ký với
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							onClick={handleGoogleLogin}
							type="button"
							className="h-12 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 hover:scale-[1.02]"
						>
							<FaGoogle className="mr-2 text-red-500" />
							Google
						</Button>
						<Button
							variant="outline"
							onClick={handleMicrosoftLogin}
							type="button"
							className="h-12 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 hover:scale-[1.02]"
						>
							<FaMicrosoft className="mr-2 text-blue-500" />
							Microsoft
						</Button>
					</div>
				</CardContent>

				<CardFooter className="pt-6">
					<p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
						Đã có tài khoản?{' '}
						<Button
							variant="link"
							className="p-0 h-auto font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
							onClick={() => router.push('/auth/login')}
						>
							Đăng nhập ngay
						</Button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
