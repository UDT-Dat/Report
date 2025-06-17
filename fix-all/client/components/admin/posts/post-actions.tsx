'use client';

import { Button } from '@/components/ui/button';
import type { Post } from '@/lib/types';
import { Check, Eye, Star, Trash2, X } from 'lucide-react';

interface PostActionsProps {
	readonly post: Post;
	readonly onView: (post: Post) => void;
	readonly onApprove: (post: Post) => void;
	readonly onReject: (post: Post) => void;
	readonly onDelete: (post: Post) => void;
	readonly onTogglePriority: (post: Post) => void;
}

export function PostActions({
	post,
	onView,
	onApprove,
	onReject,
	onDelete,
	onTogglePriority,
}: PostActionsProps) {
	return (
		<div className="flex items-end justify-end gap-2">
			<Button
				size="sm"
				variant="outline"
				onClick={() => onView(post)}
				className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
			>
				<Eye className="h-4 w-4" />
			</Button>

			{post.status === 'approved' && (
				<Button
					size="sm"
					variant="outline"
					onClick={() => onTogglePriority(post)}
					className={
						post.priority
							? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200'
							: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
					}
				>
					<Star className={`h-4 w-4 ${post.priority ? 'fill-current' : ''}`} />
				</Button>
			)}

			{post.status === 'pending' && (
				<>
					<Button
						size="sm"
						onClick={() => onApprove(post)}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						<Check className="h-4 w-4" />
					</Button>
					<Button
						size="sm"
						onClick={() => onReject(post)}
						className="bg-orange-600 hover:bg-orange-700 text-white"
					>
						<X className="h-4 w-4" />
					</Button>
				</>
			)}

			<Button
				size="sm"
				onClick={() => onDelete(post)}
				className="bg-red-600 hover:bg-red-700 text-white"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
