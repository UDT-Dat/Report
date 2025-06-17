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
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, BookmarkCheck, Pencil, Share2, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PostHeaderProps {
	readonly isAuthor: boolean;
	readonly postId: string;
	readonly postTitle: string;
	// readonly isBookmarked: boolean;
	readonly deletePostDialogOpen: boolean;
	readonly setDeletePostDialogOpen: (open: boolean) => void;
	// readonly onBookmark: () => void;
	readonly onShare: () => void;
	readonly onDeletePost: () => void;
}

export function PostHeader({
	isAuthor,
	postId,
	postTitle,
	// isBookmarked,
	deletePostDialogOpen,
	setDeletePostDialogOpen,
	// onBookmark,
	onShare,
	onDeletePost,
}: PostHeaderProps) {
	const router = useRouter();

	return (
		<div className="flex items-center justify-between mb-8">
			<Button
				variant="ghost"
				onClick={() => router.back()}
				className="gap-2 hover:bg-white/50 dark:hover:bg-gray-800/50"
			>
				<ArrowLeft className="h-4 w-4" />
				Quay lại
			</Button>

			<div className="flex gap-2">
				{isAuthor && (
					<>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push(`/editorv2/edit/${postId}`)}
							className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
						>
							<Pencil className="h-4 w-4" />
							Chỉnh sửa
						</Button>
						<AlertDialog open={deletePostDialogOpen} onOpenChange={setDeletePostDialogOpen}>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
								>
									<Trash className="h-4 w-4" />
									Xóa bài viết
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-2xl">
								<AlertDialogHeader>
									<AlertDialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
										Xác nhận xóa bài viết
									</AlertDialogTitle>
									<AlertDialogDescription className="text-gray-600 dark:text-gray-300">
										Bạn có chắc chắn muốn xóa bài viết "{postTitle}" không? Hành động này không thể
										hoàn tác và tất cả dữ liệu liên quan sẽ bị mất vĩnh viễn.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300">
										Hủy bỏ
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={onDeletePost}
										className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
									>
										Xóa bài viết
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</>
				)}
				{/* <Button
					variant="outline"
					size="sm"
					onClick={onBookmark}
					className={`gap-2 ${
						isBookmarked
							? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200'
							: 'bg-white/50 dark:bg-gray-800/50'
					}`}
				>
					{isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
					{isBookmarked ? 'Đã lưu' : 'Lưu'}
				</Button> */}
				<Button
					variant="outline"
					size="sm"
					onClick={onShare}
					className="gap-2 bg-white/50 dark:bg-gray-800/50"
				>
					<Share2 className="h-4 w-4" />
					Chia sẻ
				</Button>
			</div>
		</div>
	);
}
