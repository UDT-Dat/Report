'use client';

import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { User } from '@/lib/types';
import { Send } from 'lucide-react';

interface CommentFormProps {
	readonly user: User;
	readonly newComment: string;
	readonly submittingComment: boolean;
	readonly onCommentChange: (value: string) => void;
	readonly onSubmit: (e: React.FormEvent) => void;
}

export function CommentForm({
	user,
	newComment,
	submittingComment,
	onCommentChange,
	onSubmit,
}: CommentFormProps) {
	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="flex gap-3">
				<Avatar className="h-10 w-10">
					<AvatarImage src={parseImageUrl(user.avatar)} />
					<AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<Textarea
						placeholder="Viết bình luận của bạn..."
						value={newComment}
						onChange={(e) => onCommentChange(e.target.value)}
						className="min-h-[100px] bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
					/>
					<div className="flex justify-end mt-2">
						<Button
							type="submit"
							disabled={!newComment.trim() || submittingComment}
							className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
						>
							{submittingComment ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
									Đang gửi...
								</>
							) : (
								<>
									<Send className="h-4 w-4 mr-2" />
									Gửi bình luận
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
