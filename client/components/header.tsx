'use client';

import { useEffect, useState } from 'react';

import { Bell, File, LogOut, Menu, MessageSquare, Moon, Settings, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserRole } from '@/constants';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/lib/auth-provider';
import { cn } from '@/lib/utils';

export default function Header() {
	const pathname = usePathname();
	const router = useRouter();
	const [isMounted, setIsMounted] = useState(false);
	const { theme, setTheme } = useTheme();
	const { user, isAuthenticated, logout, tokens } = useAuth();

	// WebSocket notifications hook
	const { unreadCount, setUnreadCount } = useNotifications();

	// Handle theme toggle
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Handle notification bell click
	const handleNotificationClick = () => {
		router.push('/notifications');
	};
	console.log('unreadCount', unreadCount);
	const mainNavItems = [
		{ href: '/', label: 'Diễn đàn' },
		{ href: '/events', label: 'Sự kiện' },
		{ href: '/library', label: 'Thư viện' },
		{ href: '/posts', label: 'Bài viết' },
	];

	return (
		<TooltipProvider>
			<header className="w-full bg-[#1a2634] text-white sticky top-0 z-50 shadow-md">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-6">
							<Link href="/" className="flex items-center space-x-2">
								<Image
									src="/vltc-logo.png"
									alt="VLTC Logo"
									width={32}
									height={32}
									className="rounded-full"
								/>
								<span className="font-bold text-lg">Văn Lang Tech Club</span>
							</Link>
							<nav className="hidden md:flex space-x-6">
								{mainNavItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											'text-sm font-medium transition-colors hover:text-white/80',
											pathname === item.href ? 'text-white' : 'text-white/60'
										)}
									>
										{item.label}
									</Link>
								))}
							</nav>
						</div>

						<div className="flex items-center space-x-4">
							{isAuthenticated ? (
								<div className="flex items-center space-x-2">
									<Link href="/editorv2/create">
										<Button className="bg-blue-600 hover:bg-blue-700 rounded-full hidden sm:flex">
											Viết Bài Chia Sẻ
										</Button>
									</Link>

									{/* Notification bell */}
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="text-white/70 hover:text-white hover:bg-white/10 relative"
												onClick={handleNotificationClick}
											>
												<Bell className="h-5 w-5" />
												{unreadCount > 0 && (
													<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium animate-pulse">
														{unreadCount > 99 ? '99+' : unreadCount}
													</span>
												)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Thông báo ({unreadCount})</p>
										</TooltipContent>
									</Tooltip>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="relative h-8 w-8 rounded-full">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={
															`${process.env.NEXT_PUBLIC_API_URL}/${user?.avatar}` ||
															'/placeholder.svg'
														}
														alt="@user"
														className="object-cover"
													/>
													<AvatarFallback>U</AvatarFallback>
												</Avatar>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-56" align="end" forceMount>
											<DropdownMenuGroup>
												<DropdownMenuItem onClick={() => router.push('/profile/me')}>
													<User className="mr-2 h-4 w-4" />
													<span>Trang cá nhân</span>
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => router.push('/account/personal-details')}>
													<Settings className="mr-2 h-4 w-4" />
													<span>Thông tin cá nhân</span>
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => router.push('/account/posts')}>
													<File className="mr-2 h-4 w-4" />
													<span>Bài viết của tôi</span>
												</DropdownMenuItem>
												{[UserRole.ADMIN, UserRole.BOD].includes(user?.role as string) && (
													<DropdownMenuItem onClick={() => router.push('/dashboard')}>
														<Settings className="mr-2 h-4 w-4" />
														<span>Quản trị viên</span>
													</DropdownMenuItem>
												)}
											</DropdownMenuGroup>
											<DropdownMenuSeparator />
											{isMounted && (
												<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
													<DropdownMenuRadioItem value="light">
														<Sun className="mr-2 h-4 w-4" />
														<span>Giao diện sáng</span>
													</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="dark">
														<Moon className="mr-2 h-4 w-4" />
														<span>Giao diện tối</span>
													</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="system">
														<span className="mr-2">💻</span>
														<span>Theo hệ thống</span>
													</DropdownMenuRadioItem>
												</DropdownMenuRadioGroup>
											)}
											<DropdownMenuItem onClick={() => router.push('/feedback')}>
												<MessageSquare className="mr-2 h-4 w-4" />
												<span>Góp ý</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => logout()}>
												<LogOut className="mr-2 h-4 w-4" />
												<span>Đăng xuất</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									<Sheet>
										<SheetTrigger asChild>
											<Button variant="ghost" size="icon" className="text-white md:hidden">
												<Menu className="h-5 w-5" />
											</Button>
										</SheetTrigger>
										<SheetContent side="right" className="w-[300px] sm:w-[400px]">
											<nav className="flex flex-col space-y-4 mt-6">
												{mainNavItems.map((item) => (
													<Link
														key={item.href}
														href={item.href}
														className="text-base font-medium py-2 hover:text-blue-600"
													>
														{item.label}
													</Link>
												))}
												<Link
													href="/editorv2/create"
													className="text-base font-medium py-2 text-blue-600"
												>
													Viết Bài Chia Sẻ
												</Link>
											</nav>
										</SheetContent>
									</Sheet>
								</div>
							) : (
								<div className="flex items-center space-x-2">
									<Button
										onClick={() => router.push('/auth/login')}
										variant="outline"
										className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white"
									>
										Đăng nhập
									</Button>
									<Link href="/auth/register">
										<Button className="bg-blue-600 hover:bg-blue-700">Đăng ký</Button>
									</Link>
									<Sheet>
										<SheetTrigger asChild>
											<Button variant="ghost" size="icon" className="text-white md:hidden">
												<Menu className="h-5 w-5" />
											</Button>
										</SheetTrigger>
										<SheetContent side="right" className="w-[300px] sm:w-[400px]">
											<nav className="flex flex-col space-y-4 mt-6">
												{mainNavItems.map((item) => (
													<Link
														key={item.href}
														href={item.href}
														className="text-base font-medium py-2 hover:text-blue-600"
													>
														{item.label}
													</Link>
												))}
											</nav>
										</SheetContent>
									</Sheet>
								</div>
							)}
						</div>
					</div>
				</div>
			</header>
		</TooltipProvider>
	);
}
