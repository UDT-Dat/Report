'use client';

import type React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Comment, User } from '@/lib/types';
import { MessageCircle } from 'lucide-react';
import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';

interface CommentsSectionProps {
	readonly comments: Comment[];
	readonly user: User | null;
	readonly newComment: string;
	readonly submittingComment: boolean;
	readonly editingCommentId: string | null;
	readonly editingContent: string;
	readonly deleteCommentDialogOpen: string | null;
	readonly setDeleteCommentDialogOpen: (id: string | null) => void;
	readonly onCommentChange: (value: string) => void;
	readonly onSubmitComment: (e: React.FormEvent) => void;
	readonly onStartEditComment: (commentId: string, content: string) => void;
	readonly onCancelEditComment: () => void;
	readonly onSaveEditComment: (commentId: string) => void;
	readonly onEditContentChange: (content: string) => void;
	readonly onDeleteComment: (commentId: string) => void;
}

export function CommentsSection({
	comments,
	user,
	newComment,
	submittingComment,
	editingCommentId,
	editingContent,
	deleteCommentDialogOpen,
	setDeleteCommentDialogOpen,
	onCommentChange,
	onSubmitComment,
	onStartEditComment,
	onCancelEditComment,
	onSaveEditComment,
	onEditContentChange,
	onDeleteComment,
}: CommentsSectionProps) {
	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageCircle className="h-5 w-5" />
					Bình luận ({comments.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Comment Form */}
				{user && (
					<CommentForm
						user={user}
						newComment={newComment}
						submittingComment={submittingComment}
						onCommentChange={onCommentChange}
						onSubmit={onSubmitComment}
					/>
				)}

				{comments.length > 0 && <Separator />}

				{/* Comments List */}
				<div className="space-y-6">
					{comments.map((comment) => (
						<CommentItem
							key={comment._id}
							comment={comment}
							currentUser={user}
							editingCommentId={editingCommentId}
							editingContent={editingContent}
							deleteCommentDialogOpen={deleteCommentDialogOpen}
							setDeleteCommentDialogOpen={setDeleteCommentDialogOpen}
							onStartEdit={onStartEditComment}
							onCancelEdit={onCancelEditComment}
							onSaveEdit={onSaveEditComment}
							onEditContentChange={onEditContentChange}
							onDelete={onDeleteComment}
						/>
					))}
				</div>

				{comments.length === 0 && (
					<div className="text-center py-8">
						<MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
						<p className="text-gray-500 dark:text-gray-400">Chưa có bình luận nào</p>
						<p className="text-sm text-gray-400 dark:text-gray-500">
							Hãy là người đầu tiên bình luận!
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
