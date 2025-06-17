'use client';

import type React from 'react';

import { useEffect, useState } from 'react';

import {
	Bell,
	File,
	LogOut,
	Menu,
	MessageSquare,
	Moon,
	Search,
	Settings,
	Sun,
	User,
	X,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserRole } from '@/constants';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/lib/auth-provider';
import { parseImageUrl } from '@/lib/parseImageUrl';
import { cn } from '@/lib/utils';

export default function Header() {
	const pathname = usePathname();
	const router = useRouter();
	const [isMounted, setIsMounted] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { theme, setTheme } = useTheme();
	const { user, isAuthenticated, logout } = useAuth();
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	// WebSocket notifications hook
	const { unreadCount } = useNotifications();

	// Handle theme toggle
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		// Initialize the scroll state
		handleScroll();

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Handle notification bell click
	const handleNotificationClick = () => {
		router.push('/notifications');
	};

	// Handle search submit
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setSearchVisible(false);
			router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	};

	const mainNavItems = [
		{ href: '/', label: 'Diễn đàn' },
		{ href: '/events', label: 'Sự kiện' },
		{ href: '/library', label: 'Thư viện' },
		{ href: '/posts', label: 'Bài viết' },
	];

	return (
		<TooltipProvider>
			<div className="sticky top-0 z-50 w-full">
				<header
					className={cn(
						'w-full transition-all duration-300',
						scrolled
							? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md'
							: 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900'
					)}
				>
					<div className="container mx-auto px-4">
						<div className="flex h-16 items-center justify-between">
							<div className="flex items-center space-x-6">
								<Link href="/" className="flex items-center space-x-2 group">
									<div className="relative w-9 h-9 overflow-hidden rounded-full bg-white/10 p-1 ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
										<Image
											src="/vltc-logo.png"
											alt="VLTC Logo"
											width={32}
											height={32}
											className="rounded-full object-cover"
										/>
									</div>
									<span
										className={cn(
											'font-bold text-lg transition-colors duration-300',
											scrolled ? 'text-gray-900 dark:text-white' : 'text-white'
										)}
									>
										Văn Lang Tech Club
									</span>
								</Link>
								<nav className="hidden md:flex space-x-1">
									{mainNavItems.map((item) => (
										<Link
											key={item.href}
											href={item.href}
											className={cn(
												'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
												pathname === item.href
													? scrolled
														? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
														: 'bg-white/20 text-white'
													: scrolled
													? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
													: 'text-white/70 hover:bg-white/10 hover:text-white'
											)}
										>
											{item.label}
										</Link>
									))}
								</nav>
							</div>

							<div className="flex items-center space-x-3">
								{/* Horizontal Search Bar */}
								<form
									onSubmit={handleSearchSubmit}
									className={cn(
										'flex items-center transition-all duration-300 overflow-hidden',
										searchVisible ? 'w-64' : 'w-10'
									)}
								>
									{searchVisible ? (
										<div
											className={cn(
												'flex items-center w-full rounded-md',
												scrolled
													? 'bg-gray-100 dark:bg-gray-800'
													: 'bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm'
											)}
										>
											<Search
												className={cn(
													'h-4 w-4 ml-3',
													scrolled
														? 'text-gray-500 dark:text-gray-400'
														: 'text-white/70 dark:text-gray-300'
												)}
											/>
											<Input
												type="search"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												placeholder="Tìm kiếm..."
												className={cn(
													'border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9',
													scrolled
														? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
														: 'bg-transparent text-white dark:text-gray-100 placeholder:text-white/70 dark:placeholder:text-gray-400'
												)}
												autoFocus
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className={cn(
													'h-9 w-9',
													scrolled
														? 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
														: 'text-white/70 hover:text-white'
												)}
												onClick={() => setSearchVisible(false)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									) : (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className={cn(
												scrolled
													? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
													: 'text-white/80 hover:text-white hover:bg-white/10'
											)}
											onClick={() => setSearchVisible(true)}
										>
											<Search className="h-5 w-5" />
										</Button>
									)}
								</form>

								{isAuthenticated ? (
									<div className="flex items-center space-x-2">
										<Link href="/editorv2/create">
											<Button
												className={cn(
													'rounded-md hidden sm:flex shadow-md',
													scrolled
														? 'bg-blue-600 hover:bg-blue-700 text-white'
														: 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700'
												)}
											>
												Viết Bài Chia Sẻ
											</Button>
										</Link>

										{/* Notification bell */}
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={cn(
														'relative',
														scrolled
															? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
															: 'text-white/80 hover:text-white hover:bg-white/10'
													)}
													onClick={handleNotificationClick}
												>
													<Bell className="h-5 w-5" />
													{unreadCount > 0 && (
														<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
															<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
															<span className="relative inline-flex rounded-full h-full w-full items-center justify-center">
																{unreadCount > 99 ? '99+' : unreadCount}
															</span>
														</span>
													)}
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Thông báo {unreadCount > 0 ? `(${unreadCount})` : ''}</p>
											</TooltipContent>
										</Tooltip>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
													<Avatar
														className={cn(
															'h-9 w-9 transition-all duration-300',
															scrolled
																? 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600'
																: 'ring-2 ring-white/20 hover:ring-white/40'
														)}
													>
														<AvatarImage
															src={parseImageUrl(user?.avatar)}
															alt={user?.name || 'User'}
															className="object-cover"
														/>
														<AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
															{user?.name?.charAt(0) || 'U'}
														</AvatarFallback>
													</Avatar>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
												<div className="flex items-center justify-start gap-2 p-2">
													<div className="flex flex-col space-y-0.5">
														<p className="text-sm font-medium">{user?.name}</p>
														<p className="text-xs text-muted-foreground truncate">{user?.email}</p>
													</div>
												</div>
												<DropdownMenuSeparator />
												<DropdownMenuGroup>
													<DropdownMenuItem onClick={() => router.push('/profile/me')}>
														<User className="mr-2 h-4 w-4" />
														<span>Trang cá nhân</span>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => router.push('/account/personal-details')}
													>
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
												<DropdownMenuItem
													onClick={() => logout()}
													className="text-red-500 focus:text-red-500"
												>
													<LogOut className="mr-2 h-4 w-4" />
													<span>Đăng xuất</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
										<Sheet>
											<SheetTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={cn(
														'md:hidden',
														scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
													)}
												>
													<Menu className="h-5 w-5" />
												</Button>
											</SheetTrigger>
											<SheetContent
												side="right"
												className="w-[300px] sm:w-[400px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
											>
												<div className="flex items-center gap-4 mb-8 mt-4">
													<Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800">
														<AvatarImage
															src={parseImageUrl(user?.avatar) || '/default-avatar.png'}
															alt={user?.name ?? 'User'}
														/>
														<AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg">
															{user?.name?.charAt(0) ?? 'U'}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{user?.name}</p>
														<p className="text-sm text-gray-500 dark:text-gray-400">
															{user?.email}
														</p>
													</div>
												</div>
												<nav className="flex flex-col space-y-1">
													{mainNavItems.map((item) => (
														<Link
															key={item.href}
															href={item.href}
															className={cn(
																'px-4 py-3 rounded-md text-base font-medium transition-all duration-200',
																pathname === item.href
																	? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
																	: 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
															)}
														>
															{item.label}
														</Link>
													))}
													<Link
														href="/editorv2/create"
														className="px-4 py-3 rounded-md text-base font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
													>
														Viết Bài Chia Sẻ
													</Link>
													<Link
														href="/profile/me"
														className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800/50"
													>
														Trang cá nhân
													</Link>
													<Link
														href="/account/personal-details"
														className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800/50"
													>
														Thông tin cá nhân
													</Link>
													<button
														onClick={() => logout()}
														className="px-4 py-3 rounded-md text-base font-medium text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
													>
														Đăng xuất
													</button>
												</nav>
												<div className="px-4 py-3">
													<div className="relative">
														<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
														<Input
															type="search"
															placeholder="Tìm kiếm..."
															className="pl-8 w-full"
														/>
													</div>
												</div>
											</SheetContent>
										</Sheet>
									</div>
								) : (
									<div className="flex items-center space-x-2">
										<Button
											onClick={() => router.push('/auth/login')}
											variant="outline"
											className={cn(
												scrolled
													? 'bg-transparent border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
													: 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white'
											)}
										>
											Đăng nhập
										</Button>
										<Link href="/auth/register">
											<Button
												className={cn(
													'shadow-md',
													scrolled
														? 'bg-blue-600 hover:bg-blue-700 text-white'
														: 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700'
												)}
											>
												Đăng ký
											</Button>
										</Link>
										<Sheet>
											<SheetTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={cn(
														'md:hidden',
														scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
													)}
												>
													<Menu className="h-5 w-5" />
												</Button>
											</SheetTrigger>
											<SheetContent
												side="right"
												className="w-[300px] sm:w-[400px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
											>
												<div className="flex items-center gap-4 mb-8 mt-4">
													<div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
														V
													</div>
													<div>
														<p className="font-medium">Văn Lang Tech Club</p>
														<p className="text-sm text-gray-500 dark:text-gray-400">
															Chưa đăng nhập
														</p>
													</div>
												</div>
												<nav className="flex flex-col space-y-1">
													{mainNavItems.map((item) => (
														<Link
															key={item.href}
															href={item.href}
															className={cn(
																'px-4 py-3 rounded-md text-base font-medium transition-all duration-200',
																pathname === item.href
																	? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
																	: 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
															)}
														>
															{item.label}
														</Link>
													))}
													<div className="pt-4 flex flex-col space-y-2">
														<Link href="/auth/login">
															<Button variant="outline" className="w-full">
																Đăng nhập
															</Button>
														</Link>
														<Link href="/auth/register">
															<Button className="w-full bg-blue-600 hover:bg-blue-700">
																Đăng ký
															</Button>
														</Link>
													</div>
												</nav>
												<div className="px-4 py-3">
													<div className="relative">
														<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
														<Input
															type="search"
															placeholder="Tìm kiếm..."
															className="pl-8 w-full"
														/>
													</div>
												</div>
											</SheetContent>
										</Sheet>
									</div>
								)}
							</div>
						</div>
					</div>
				</header>
			</div>
		</TooltipProvider>
	);
}
