'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { Post } from '@/lib/types';
import { AlertCircle, Loader2, Star } from 'lucide-react';
import { PostActions } from './post-actions';
import { PostStatusBadge } from './post-status-badge';

interface PostTableProps {
	readonly posts: Post[];
	readonly loading: boolean;
	readonly onView: (post: Post) => void;
	readonly onApprove: (post: Post) => void;
	readonly onReject: (post: Post) => void;
	readonly onDelete: (post: Post) => void;
	readonly onTogglePriority: (post: Post) => void;
}

export function PostTable({
	posts,
	loading,
	onView,
	onApprove,
	onReject,
	onDelete,
	onTogglePriority,
}: PostTableProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Đang tải...</span>
			</div>
		);
	}

	if (posts?.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-gray-500">
				<AlertCircle className="h-12 w-12 mb-4" />
				<p>Không có bài viết nào</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Tiêu đề</TableHead>
					<TableHead>Tác giả</TableHead>
					<TableHead>Ngày tạo</TableHead>
					<TableHead>Trạng thái</TableHead>
					<TableHead className="text-right">Thao tác</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{posts?.map((post) => (
					<TableRow
						key={post._id}
						className={post.priority ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}
					>
						<TableCell className="font-medium">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<p className="font-semibold">{post.title}</p>
									{post.priority ? <Star className="h-4 w-4 text-yellow-500 fill-current" /> : null}
								</div>
								<p
									className="text-sm text-gray-500 line-clamp-2"
									dangerouslySetInnerHTML={{
										__html: post.content.replace(/<[^>]*>/g, ''),
									}}
								/>
							</div>
						</TableCell>
						<TableCell>
							<div className="flex items-center space-x-3">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={parseImageUrl(post.createdBy?.avatar)}
										alt={post.createdBy?.name}
									/>
									<AvatarFallback>{post.createdBy?.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium text-sm">{post.createdBy?.name}</p>
									<p className="text-xs text-gray-500">{post.createdBy?.email}</p>
								</div>
							</div>
						</TableCell>
						<TableCell>{formatDate(post.createdAt)}</TableCell>
						<TableCell>
							<PostStatusBadge status={post.status} />
						</TableCell>
						<TableCell className="text-right">
							<PostActions
								post={post}
								onView={onView}
								onApprove={onApprove}
								onReject={onReject}
								onDelete={onDelete}
								onTogglePriority={onTogglePriority}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
