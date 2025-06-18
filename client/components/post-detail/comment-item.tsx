'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { Comment, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Check, Pencil, ThumbsUp, Trash, X } from 'lucide-react';

interface CommentItemProps {
	readonly comment: Comment;
	readonly currentUser: User | null;
	readonly editingCommentId: string | null;
	readonly editingContent: string;
	readonly deleteCommentDialogOpen: string | null;
	readonly setDeleteCommentDialogOpen: (id: string | null) => void;
	readonly onStartEdit: (commentId: string, content: string) => void;
	readonly onCancelEdit: () => void;
	readonly onSaveEdit: (commentId: string) => void;
	readonly onEditContentChange: (content: string) => void;
	readonly onDelete: (commentId: string) => void;
}

export function CommentItem({
	comment,
	currentUser,
	editingCommentId,
	editingContent,
	deleteCommentDialogOpen,
	setDeleteCommentDialogOpen,
	onStartEdit,
	onCancelEdit,
	onSaveEdit,
	onEditContentChange,
	onDelete,
}: CommentItemProps) {
	const isOwner = currentUser && currentUser._id === comment.createdBy._id;
	const isEditing = editingCommentId === comment._id;

	return (
		<div className="flex gap-3">
			<Avatar className="h-10 w-10">
				<AvatarImage src={parseImageUrl(comment.createdBy.avatar)} alt={comment.createdBy.name} />
				<AvatarFallback>{comment.createdBy.name?.charAt(0) || 'U'}</AvatarFallback>
			</Avatar>
			<div className="flex-1">
				<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 relative">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-gray-800 dark:text-gray-100">
								{comment.createdBy.name}
							</span>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								{formatDate(comment.createdAt)}
							</span>
							{comment.updatedAt !== comment.createdAt && (
								<span className="text-xs text-gray-400 dark:text-gray-500">(đã chỉnh sửa)</span>
							)}
						</div>
						{isOwner && !isEditing && (
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onStartEdit(comment._id, comment.content)}
									className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
								>
									<Pencil className="h-3 w-3" />
								</Button>
								<AlertDialog
									open={deleteCommentDialogOpen === comment._id}
									onOpenChange={(open) => setDeleteCommentDialogOpen(open ? comment._id : null)}
								>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
										>
											<Trash className="h-3 w-3" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-2xl">
										<AlertDialogHeader>
											<AlertDialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
												Xác nhận xóa bình luận
											</AlertDialogTitle>
											<AlertDialogDescription className="text-gray-600 dark:text-gray-300">
												Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn
												tác.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300">
												Hủy bỏ
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => {
													onDelete(comment._id);
													setDeleteCommentDialogOpen(null);
												}}
												className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
											>
												Xóa bình luận
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						)}
					</div>

					{isEditing ? (
						<div className="space-y-3">
							<Textarea
								value={editingContent}
								onChange={(e) => onEditContentChange(e.target.value)}
								className="min-h-[60px] resize-none bg-white dark:bg-gray-600"
								placeholder="Sửa bình luận..."
							/>
							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={() => onSaveEdit(comment._id)}
									disabled={!editingContent.trim()}
									className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
								>
									<Check className="w-4 h-4 mr-1" />
									Lưu
								</Button>
								<Button size="sm" variant="outline" onClick={onCancelEdit}>
									<X className="w-4 h-4 mr-1" />
									Hủy
								</Button>
							</div>
						</div>
					) : (
						<p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
					)}
				</div>
				<div className="flex items-center gap-4 mt-2 ml-4">
					<Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
						<ThumbsUp className="h-4 w-4 mr-1" />
						Thích
					</Button>
					<Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
						Trả lời
					</Button>
				</div>
			</div>
		</div>
	);
}
