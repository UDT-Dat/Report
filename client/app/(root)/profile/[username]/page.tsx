'use client';
import { use, useEffect, useState } from 'react';

import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import PaginationClient from '@/components/pagination/PaginationClient';
import { ProfilePostsSkeleton, ProfileSkeleton } from '@/components/profile-skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { Post, User as UserType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
	const { username } = use(params);
	const { user: currentUser } = useAuth();
	const [user, setUser] = useState<UserType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [postsLoading, setPostsLoading] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [totalPosts, setTotalPosts] = useState(0);
	const [filter, setFilter] = useState<{
		page: number;
		limit: number;
	}>({
		page: 1,
		limit: 10,
	});
	const fetchPosts = async () => {
		if (!currentUser?._id && username === 'me') {
			setPostsLoading(true);
			return;
		}
		const query = new URLSearchParams();
		query.set('createdBy', username === 'me' ? (currentUser?._id as string) : username);
		query.set('page', filter.page.toString());
		query.set('limit', filter.limit.toString());
		const response = await fetchApi(`/posts?${query.toString()}`, {
			method: 'GET',
		});
		if (response.status === 200) {
			setPosts(response.result.posts);
			setTotalPosts(response.result.pagination?.total || 0);
		}
	};
	const fetchUser = async () => {
		if (username === 'me') {
			if (currentUser) {
				setUser(currentUser);
				setIsLoading(false);
			}
		} else {
			fetchApi(
				`/users/${username}`,
				{
					method: 'GET',
				},
				{
					accessToken: undefined,
					refreshToken: undefined,
				}
			).then((res) => {
				if (res.result) {
					setUser(res.result);
				}
			});
		}
	};
	useEffect(() => {
		Promise.all([fetchUser(), fetchPosts()]).then(() => {
			setIsLoading(false);
			setPostsLoading(false);
		});
	}, [username, currentUser, filter]);

	useEffect(() => {
		if (currentUser && username === 'me') {
			setIsLoading(false);
		}
	}, [currentUser, username]);

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<p className="text-gray-500">Không tìm thấy thông tin người dùng.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Cover Image */}
			<div className="relative h-48 w-full bg-gray-200 md:h-64">
				<Image
					src={
						user.coverImage
							? `${process.env.NEXT_PUBLIC_API_URL}/${user.coverImage}`
							: '/placeholder.svg'
					}
					alt="Cover"
					fill
					className="object-cover"
				/>
			</div>

			<div className="container mx-auto px-4 max-w-5xl">
				{/* Profile Header */}
				<div className="relative -mt-8 mb-6 flex flex-col items-center md:flex-row md:items-end md:space-x-6">
					<div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white">
						<Image
							src={
								user.avatar
									? `${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`
									: '/placeholder.svg'
							}
							alt={user.name || 'User'}
							fill
							className="object-cover"
						/>
					</div>
					<div className="mt-4 flex flex-1 flex-col items-center text-center md:items-start md:text-left">
						<h1 className="text-2xl font-bold">{user.name}</h1>
						<p className="text-sm text-gray-500">{user.email}</p>
						<div className="mt-2 flex items-center space-x-4 text-sm">
							<div className="flex items-center">
								<MapPin className="mr-1 h-4 w-4 text-gray-500" />
								<span>{user.address || 'Không có địa chỉ'}</span>
							</div>
							<div className="flex items-center">
								<Calendar className="mr-1 h-4 w-4 text-gray-500" />
								<span>Tham gia {formatDate(user.createdAt)}</span>
							</div>
						</div>
					</div>
				</div>
				{postsLoading ? (
					<ProfilePostsSkeleton />
				) : (
					<div className="space-y-4">
						{posts.length > 0 ? (
							posts.map((post, i) => (
								<Card key={i}>
									<CardContent className="p-4">
										<div className="mb-2 flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-gray-300">
													<Image
														src={
															user.avatar
																? `${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`
																: '/placeholder.svg'
														}
														alt={user.name || 'User'}
														width={40}
														height={40}
														className="rounded-full"
													/>
												</div>
												<div>
													<p className="font-medium">{user.name}</p>
													<p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
												</div>
											</div>
										</div>
										<Link href={`/posts/${post._id}`}>
											<p className="mb-4 text-gray-600 line-clamp-2 dark:text-gray-100">
												{post.title}
											</p>
											{post.bannerImage && (
												<div className="relative w-full h-96 mb-4">
													<Image
														src={`${process.env.NEXT_PUBLIC_API_URL}/${post.bannerImage}`}
														alt="Post image"
														fill
														className="rounded-lg object-cover"
													/>
												</div>
											)}
										</Link>
										<div className="flex items-center justify-between text-sm text-gray-500">
											<div className="flex items-center space-x-4">
												<span>👍 {post.likes ?? 0} thích</span>
												<span>💬 {post.comments ?? 0} bình luận</span>
											</div>
										</div>
									</CardContent>
								</Card>
							))
						) : (
							<div className="text-center text-gray-500">
								<p>Không có bài viết nào</p>
							</div>
						)}
					</div>
				)}
				<PaginationClient
					total={totalPosts}
					filter={filter}
					setFilter={setFilter}
					className="my-4"
				/>
			</div>
		</div>
	);
}
