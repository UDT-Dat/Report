'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface PostActionsProps {
	readonly isLiked: boolean;
	readonly likesCount: number;
	readonly commentsCount: number;
	readonly onLike: () => void;
	readonly onShare: () => void;
}

export function PostActions({
	isLiked,
	likesCount,
	commentsCount,
	onLike,
	onShare,
}: PostActionsProps) {
	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button
							variant="outline"
							onClick={onLike}
							className={`gap-2 ${
								isLiked
									? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
									: 'hover:bg-red-50 hover:text-red-700 hover:border-red-200'
							}`}
						>
							<Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
							{likesCount} Thích
						</Button>
						<Button
							variant="outline"
							className="gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
						>
							<MessageCircle className="h-4 w-4" />
							{commentsCount} Bình luận
						</Button>
					</div>
					<Button variant="outline" onClick={onShare} className="gap-2">
						<Share2 className="h-4 w-4" />
						Chia sẻ
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
