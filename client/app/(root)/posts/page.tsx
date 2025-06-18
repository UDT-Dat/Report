'use client';

import type React from 'react';

import {
	ArrowRight,
	BookOpen,
	Clock,
	Filter,
	Heart,
	MessageCircle,
	Plus,
	Search,
	TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import PaginationClient from '@/components/pagination/PaginationClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchApi } from '@/lib/api';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function PostsPage() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState({
		page: 1,
		limit: 12,
	});
	const router = useRouter();

	useEffect(() => {
		async function fetchPosts(filter: any) {
			try {
				setLoading(true);
				const query = new URLSearchParams(filter);
				const response = await fetchApi(
					`/posts?${query.toString()}`,
					{
						method: 'GET',
					},
					{
						accessToken: undefined,
						refreshToken: undefined,
					}
				);
				if (response.status === 200) {
					setPosts((response.result.posts as Post[]) || []);
					setTotal(response.result.pagination?.total ?? 0);
				} else {
					setPosts([]);
				}
			} catch (error) {
				console.error('Error fetching posts:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchPosts(filter);
	}, [filter]); // Updated to use filter object as a dependency

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement search functionality
		console.log('Searching for:', search);
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			published: {
				label: 'Đã xuất bản',
				className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
			},
			draft: {
				label: 'Bản nháp',
				className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
			},
			pending: {
				label: 'Chờ duyệt',
				className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
			},
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.published;
		return (
			<Badge variant="outline" className={config.className}>
				{config.label}
			</Badge>
		);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
				{/* Background decoration */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
				</div>

				<div className="container mx-auto px-4 py-8 relative">
					{/* Header Skeleton */}
					<div className="text-center mb-12">
						<Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
						<Skeleton className="h-12 w-64 mx-auto mb-4" />
						<Skeleton className="h-6 w-96 mx-auto" />
					</div>

					{/* Filter Bar Skeleton */}
					<div className="mb-8">
						<Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
							<CardContent className="p-6">
								<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
									<Skeleton className="h-10 w-full md:w-80" />
									<div className="flex gap-2">
										<Skeleton className="h-10 w-24" />
										<Skeleton className="h-10 w-32" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Posts Grid Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{Array.from({ length: 6 }).map((_, idx) => (
							<Card
								key={idx}
								className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden"
							>
								<div className="relative">
									<Skeleton className="aspect-[16/9] w-full" />
									<Skeleton className="absolute top-4 right-4 h-6 w-20 rounded-full" />
								</div>
								<CardHeader className="pb-3">
									<Skeleton className="h-6 w-full mb-2" />
									<div className="flex items-center gap-3">
										<Skeleton className="h-8 w-8 rounded-full" />
										<div className="space-y-1">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-32" />
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
									</div>
								</CardContent>
								<CardFooter>
									<div className="flex justify-between items-center w-full">
										<div className="flex gap-4">
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-4 w-20" />
										</div>
										<Skeleton className="h-8 w-20" />
									</div>
								</CardFooter>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
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
				<div className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-6 shadow-lg">
						<BookOpen className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
						Bài viết CLB IT VLU
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						Khám phá những bài viết công nghệ thú vị, chia sẻ kiến thức và kinh nghiệm từ cộng đồng
						IT VLU
					</p>
				</div>

				{/* Filter and Search Bar */}
				<div className="mb-8">
					<Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
								<form onSubmit={handleSearch} className="flex-1 max-w-md">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
										<Input
											type="search"
											placeholder="Tìm kiếm bài viết..."
											className="pl-10 bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
											value={search}
											onChange={(e) => setSearch(e.target.value)}
										/>
									</div>
								</form>
								<div className="flex gap-2">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600"
											>
												<Filter className="w-4 h-4 mr-2" />
												Lọc
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem>Tất cả bài viết</DropdownMenuItem>
											<DropdownMenuItem>Mới nhất</DropdownMenuItem>
											<DropdownMenuItem>Phổ biến nhất</DropdownMenuItem>
											<DropdownMenuItem>Nhiều lượt thích</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									<Button
										onClick={() => router.push('/editorv2/create')}
										className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
									>
										<Plus className="w-4 h-4 mr-2" />
										Tạo bài viết
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Posts Grid */}
				{posts.length === 0 ? (
					<div className="text-center py-16">
						<Card className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
							<CardContent className="p-8">
								<div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
									<BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
								</div>
								<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
									Chưa có bài viết nào
								</h3>
								<p className="text-gray-500 dark:text-gray-400 mb-6">
									Hãy là người đầu tiên chia sẻ kiến thức với cộng đồng IT VLU
								</p>
								<Button
									onClick={() => router.push('/editorv2/create')}
									className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
								>
									<Plus className="w-4 h-4 mr-2" />
									Tạo bài viết đầu tiên
								</Button>
							</CardContent>
						</Card>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{posts?.map((post, index) => (
								<Link href={`/posts/${post._id}`} key={post._id}>
									<Card className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
										<div className="relative overflow-hidden">
											<div className="aspect-[16/9] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
												{post.bannerImage ? (
													<img
														src={parseImageUrl(post.bannerImage)}
														alt={post.title}
														className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
													/>
												) : (
													<BookOpen className="w-12 h-12 text-blue-400 dark:text-blue-500" />
												)}
											</div>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											{post.priority && (
												<Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
													<TrendingUp className="w-3 h-3 mr-1" />
													Nổi bật
												</Badge>
											)}
											{getStatusBadge(post.status ?? 'published')}
										</div>

										<CardHeader className="pb-3">
											<CardTitle className="text-lg font-bold line-clamp-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
												{post.title}
											</CardTitle>
											<CardDescription className="flex items-center gap-3">
												<Avatar className="h-8 w-8 border-2 border-blue-200 dark:border-blue-600">
													<AvatarImage
														src={parseImageUrl(post.createdBy?.avatar)}
														alt={post.createdBy?.name}
													/>
													<AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
														{post.createdBy?.name?.charAt(0) || 'A'}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
														{post.createdBy?.name}
													</p>
													<div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
														<Clock className="w-3 h-3 mr-1" />
														{formatDate(post.createdAt)}
													</div>
												</div>
											</CardDescription>
										</CardHeader>

										<CardContent className="pt-0">
											<p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
												{post.content.replace(/<[^>]*>/g, '')}
											</p>
										</CardContent>

										<CardFooter className="flex justify-between items-center pt-4">
											<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
												<div className="flex items-center gap-1">
													<Heart className="w-4 h-4 text-red-500" />
													<span>{post.likes}</span>
												</div>
												<div className="flex items-center gap-1">
													<MessageCircle className="w-4 h-4 text-blue-500" />
													<span>{post.comments}</span>
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => router.push(`/posts/${post._id}`)}
												className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
											>
												Xem thêm
												<ArrowRight className="w-4 h-4 ml-1" />
											</Button>
										</CardFooter>
									</Card>
								</Link>
							))}
						</div>

						{/* Pagination */}
						{total > 0 && (
							<div className="mt-12 flex justify-center">
								<div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
									<PaginationClient total={total} filter={filter} setFilter={setFilter} />
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
