'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { UserStatus } from '@/lib/types';
import { Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const { toast } = useToast();
	const { login, user } = useAuth();

	useEffect(() => {
		if (
			user?.status === UserStatus.PENDING ||
			user?.status === UserStatus.VERIFYING ||
			user?.status === UserStatus.REJECTED
		) {
			router.push('/auth/verify-student');
		}
	}, [user, router]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			toast({
				title: 'Lỗi đăng nhập',
				description: 'Vui lòng nhập cả email và mật khẩu',
				variant: 'destructive',
			});
			return;
		}

		setLoading(true);

		const res = await login(email, password);
		if (res.status === 201) {
			toast({
				title: 'Đăng nhập thành công',
				description: 'Đăng nhập thành công',
				variant: 'success',
			});
			console.log(res.result);

			localStorage.setItem('user_status', res.result.user.status);

			document.cookie = `user_status=${res.result.user.status}; path=/`;

			if (
				res.result.user.status === UserStatus.PENDING ||
				res.result.user.status === UserStatus.VERIFYING ||
				res.result.user.status === UserStatus.REJECTED
			) {
				router.push('/auth/verify-student?userId=' + res.result.user._id);
			}
		} else {
			toast({
				title: 'Đăng nhập thất bại',
				description: res.result.message ?? 'Có lỗi xảy ra khi đăng nhập',
				variant: 'destructive',
			});
		}
		setLoading(false);
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
				<CardHeader className="space-y-4 text-center pb-8">
					<div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
						<Sparkles className="w-8 h-8 text-white" />
					</div>
					<CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
						Chào mừng trở lại
					</CardTitle>
					<CardDescription className="text-gray-600 dark:text-gray-300 text-base">
						Đăng nhập để tiếp tục hành trình của bạn
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					<form onSubmit={handleLogin} className="space-y-5">
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Email
							</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
								<Input
									id="email"
									type="email"
									placeholder="email@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="password"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Mật khẩu
								</Label>
								<Link
									href="/auth/forgot-password"
									className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
								>
									Quên mật khẩu?
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={'password'}
									value={password}
									placeholder="Nhập mật khẩu"
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200"
									required
								/>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
							disabled={loading}
						>
							{loading ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Đang đăng nhập...
								</div>
							) : (
								'Đăng nhập'
							)}
						</Button>
					</form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-200 dark:border-gray-600" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-medium">
								Hoặc tiếp tục với
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
						Chưa có tài khoản?{' '}
						<Button
							variant="link"
							className="p-0 h-auto font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
							onClick={() => router.push('/auth/register')}
						>
							Đăng ký ngay
						</Button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
