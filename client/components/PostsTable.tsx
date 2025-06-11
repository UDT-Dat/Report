"use client";

import {
  useEffect,
  useState,
} from 'react';

import {
  Edit,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import PaginationClient from '@/components/pagination/PaginationClient';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchApi } from '@/lib/api';
import { Post } from '@/lib/types';

interface PostsTableProps {
	userId?: string;
	tokens?: { accessToken: string | undefined; refreshToken: string | undefined } | null;
}

export default function PostsTable({ userId, tokens }: PostsTableProps) {
	const router = useRouter();
	const [posts, setPosts] = useState<Post[]>([]);
	const [totalPosts, setTotalPosts] = useState(0);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState({
		page: 1,
		limit: 10,
		createdBy: userId,
	})
	const [deletingId, setDeletingId] = useState<string | null>(null);
	async function deletePost(id: string): Promise<Post> {
		const response = await fetchApi(`/posts/${id}`, {
			method: 'DELETE',
		}, tokens);

		if (response.status === 200) {
			return response.result;
		}
		throw new Error(response.result.message || 'Failed to delete post');
	}
	// Fetch posts
	const fetchPosts = async () => {
		setLoading(true);
		const query = new URLSearchParams();
		query.set("page", filter.page.toString());
		query.set("limit", filter.limit.toString());
		query.set("createdBy", filter.createdBy || "");

		const response = await fetchApi(`/posts?${query.toString()}`, {
			method: 'GET',
		}, tokens);
		setPosts(response.result.posts);
		setTotalPosts(response.result.pagination.total);
	};

	// Delete post
	const handleDelete = async (postId: string) => {
		try {
			setDeletingId(postId);
			await deletePost(postId);
			toast.success('Xóa bài viết thành công', {
				duration: 2000,
			});
			// Refresh the list
			await fetchPosts();
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Không thể xóa bài viết', {
				duration: 2000,
			});
		} finally {
			setDeletingId(null);
		}
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Truncate text
	const truncateText = (text: string, maxLength: number = 100) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};

	useEffect(() => {
		fetchPosts().finally(() => {
			setLoading(false);
		});
	}, [userId, filter]);

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="border rounded-lg">
					<div className="p-4 space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-4">
								<Skeleton className="h-4 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Quản lý bài viết</h2>
				<Button
					onClick={() => router.push('/editorv2/create')}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					Thêm bài viết
				</Button>
			</div>

			{/* Table */}
			{posts.length === 0 ? (
				<div className="text-center py-8 border rounded-lg">
					<p className="text-gray-500">Không có bài viết nào</p>
				</div>
			) : (
				<div className="border rounded-lg">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tiêu đề</TableHead>
								<TableHead>Tác giả</TableHead>
								<TableHead>Ngày tạo</TableHead>
								<TableHead>Lượt thích</TableHead>
								<TableHead>Bình luận</TableHead>
								<TableHead className="text-right">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{posts.map((post) => (
								<TableRow key={post._id}>
									<TableCell className="font-medium max-w-xs">
										{truncateText(post.title, 50)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{post.createdBy.avatar && (
												<img
													src={`${process.env.NEXT_PUBLIC_API_URL}/${post.createdBy.avatar}`}
													alt={post.createdBy.name}
													className="w-6 h-6 rounded-full"
												/>
											)}
											<span className="text-sm">{post.createdBy.name}</span>
										</div>
									</TableCell>
									<TableCell className="text-sm">
										{formatDate(post.createdAt)}
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{post.likes}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{post.comments}</Badge>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => router.push(`/posts/${post._id}`)}
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => router.push(`/editorv2/edit/${post._id}`)}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="outline"
														size="sm"
														disabled={deletingId === post._id}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Xóa bài viết</AlertDialogTitle>
														<AlertDialogDescription>
															Bạn có chắc chắn muốn xóa bài viết "{post.title}"?
															Hành động này không thể hoàn tác.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Hủy</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(post._id)}
															className="bg-red-600 hover:bg-red-700"
														>
															Xóa
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Pagination */}
			<PaginationClient
				total={totalPosts}
				filter={filter}
				setFilter={setFilter}
				className='my-4'
			/>
		</div>
	);
} 