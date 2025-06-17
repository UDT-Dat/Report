'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { Post } from '@/lib/types';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PostGridProps {
	readonly posts: Post[];
	readonly loading: boolean;
}

function PostGridSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={`skeleton-${i}-${Math.random().toString(36)}`}
					className="flex space-x-4 animate-pulse"
				>
					<div className="bg-gray-200 dark:bg-gray-700 w-[100px] h-[100px] rounded-xl" />
					<div className="flex-1 space-y-3">
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
						<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
						<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
					</div>
				</div>
			))}
		</div>
	);
}

export function PostGrid({ posts, loading }: PostGridProps) {
	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
			<CardHeader>
				<CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
					Bài viết gần đây
				</CardTitle>
			</CardHeader>
			<CardContent>
				{loading || posts.length < 2 ? (
					<PostGridSkeleton />
				) : (
					<div className="grid gap-4 sm:grid-cols-2">
						{posts.slice(1, 5).map((post) => (
							<Link
								key={post._id}
								href={`/posts/${post._id}`}
								className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
							>
								<Image
									src={parseImageUrl(post.bannerImage)}
									alt="Article thumbnail"
									width={100}
									height={100}
									className="w-[100px] h-[100px] object-cover rounded-xl"
								/>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
										{post.title} 123
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
										{post.content?.replace(/<[^>]*>/g, '').slice(0, 100) + '...'}
									</p>
									<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
										{post.createdBy?.name || ''}
									</p>
								</div>
							</Link>
						))}
					</div>
				)}

				<div className="mt-6 text-center">
					<Link href="/posts">
						<Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
							<BookOpen className="w-4 h-4 mr-2" />
							Xem tất cả bài viết
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
