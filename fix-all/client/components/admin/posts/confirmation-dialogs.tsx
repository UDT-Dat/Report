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
} from '@/components/ui/alert-dialog';
import type { Post, PostStatus } from '@/lib/types';

interface ConfirmationDialogsProps {
	// Action dialog
	readonly actionDialogOpen: boolean;
	readonly setActionDialogOpen: (open: boolean) => void;
	readonly actionType: PostStatus | null;
	readonly postToAction: Post | null;
	readonly onConfirmAction: () => void;

	// Delete dialog
	readonly deleteDialogOpen: boolean;
	readonly setDeleteDialogOpen: (open: boolean) => void;
	readonly postToDelete: Post | null;
	readonly onConfirmDelete: () => void;

	// Priority dialog
	readonly priorityDialogOpen: boolean;
	readonly setPriorityDialogOpen: (open: boolean) => void;
	readonly postToPriority: Post | null;
	readonly onConfirmPriority: () => void;
}

export function ConfirmationDialogs({
	actionDialogOpen,
	setActionDialogOpen,
	actionType,
	postToAction,
	onConfirmAction,
	deleteDialogOpen,
	setDeleteDialogOpen,
	postToDelete,
	onConfirmDelete,
	priorityDialogOpen,
	setPriorityDialogOpen,
	postToPriority,
	onConfirmPriority,
}: ConfirmationDialogsProps) {
	return (
		<>
			{/* Action Confirmation Dialog (Approve only) */}
			<AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận duyệt bài viết</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn duyệt bài viết "{postToAction?.title}"?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={onConfirmAction} className="bg-blue-600 hover:bg-blue-700">
							Duyệt
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa bài viết "{postToDelete?.title}"? Hành động này không thể
							hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={onConfirmDelete} className="bg-red-600 hover:bg-red-700">
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Priority Confirmation Dialog */}
			<AlertDialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{postToPriority?.priority ? 'Bỏ ưu tiên bài viết' : 'Đặt bài viết ưu tiên'}
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn {postToPriority?.priority ? 'bỏ ưu tiên' : 'đặt ưu tiên'} cho
							bài viết "{postToPriority?.title}"?
							{!postToPriority?.priority && (
								<span className="block mt-2 text-sm text-yellow-600">
									Bài viết ưu tiên sẽ được hiển thị nổi bật trên trang chủ.
								</span>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={onConfirmPriority}
							className={
								postToPriority?.priority
									? 'bg-gray-600 hover:bg-gray-700'
									: 'bg-yellow-600 hover:bg-yellow-700'
							}
						>
							{postToPriority?.priority ? 'Bỏ ưu tiên' : 'Đặt ưu tiên'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
