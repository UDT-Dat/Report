'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns'; // Import formatDistanceToNow
import { vi } from 'date-fns/locale'; // Import Vietnamese locale
import { Calendar, Clock, Heart, MessageCircle } from 'lucide-react';

interface PostMetaProps {
	readonly author: User;
	readonly createdAt: string;
	readonly likesCount: number;
	readonly commentsCount: number;
	readonly content: string; // Add content prop to estimate reading time
}

export function PostMeta({ author, createdAt, likesCount, commentsCount, content }: PostMetaProps) {
	// Estimate reading time
	const wordsPerMinute = 200; // Average reading speed
	const wordCount = content.split(/\s+/).filter(Boolean).length;
	const readingTime = Math.ceil(wordCount / wordsPerMinute);

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex items-center gap-4">
					<Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-600">
						<AvatarImage src={parseImageUrl(author.avatar)} alt={author.name} />
						<AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
							{author.name?.charAt(0) || 'A'}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-semibold text-gray-800 dark:text-gray-100">{author.name}</p>
						<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{/* Use formatDistanceToNow for "time ago" format */}
								{formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: vi })}
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								{readingTime === 0 ? 'Dưới 1 phút đọc' : `${readingTime} phút đọc`}
							</div>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
					<div className="flex items-center gap-1">
						<Heart className="h-4 w-4" />
						<span>{likesCount}</span>
					</div>
					<div className="flex items-center gap-1">
						<MessageCircle className="h-4 w-4" />
						<span>{commentsCount}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
