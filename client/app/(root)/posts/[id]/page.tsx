'use client';

import type React from 'react';

import {
	ArrowLeft,
	Bookmark,
	BookmarkCheck,
	Calendar,
	Check,
	Clock,
	Download,
	FileText,
	Heart,
	MessageCircle,
	Pencil,
	Send,
	Share2,
	ThumbsUp,
	Trash,
	X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api'; // Assuming you have a fetchApi utility
import { useAuth } from '@/lib/auth-provider';
import type { Comment, Post } from '@/lib/types';
import { formatDate, updateSrcImage } from '@/lib/utils';

export default function PostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const { user, tokens } = useAuth(); // Assuming useAuth provides tokens
	const postId = params.id as string;

	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [isLiked, setIsLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(0); // State for dynamic like count
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [newComment, setNewComment] = useState('');
	const [submittingComment, setSubmittingComment] = useState(false);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState('');

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				// Fetch Post
				const postResponse = await fetchApi(
					`/posts/${postId}`,
					{
						method: 'GET',
					},
					{
						accessToken: tokens?.accessToken,
						refreshToken: tokens?.refreshToken,
					}
				);
				if (postResponse.status === 200) {
					setPost(postResponse.result);
					setLikesCount(postResponse.result.likes);
					console.log('Post data:', postResponse.result);
					console.log('Attachments:', postResponse.result.attachments);
				} else {
					toast({
						title: 'Lỗi',
						description: 'Không thể tải bài viết.',
						variant: 'destructive',
					});
					setPost(null); // Set post to null if not found
				}

				// Fetch Comments
				const commentsResponse = await fetchApi(
					`/comments?postId=${postId}`,
					{
						method: 'GET',
					},
					{
						accessToken: tokens?.accessToken,
						refreshToken: tokens?.refreshToken,
					}
				);
				if (commentsResponse.status === 200) {
					setComments(commentsResponse.result.comments);
				} else {
					toast({
						title: 'Lỗi',
						description: 'Không thể tải bình luận.',
						variant: 'destructive',
					});
				}

				// Check if liked by current user
				if (user) {
					const likedResponse = await fetchApi(
						`/likes/${postId}/check`,
						{
							method: 'GET',
						},
						{
							accessToken: tokens?.accessToken,
							refreshToken: tokens?.refreshToken,
						}
					);
					if (likedResponse.status === 200) {
						setIsLiked(likedResponse.result.isLiked);
					}
				}

				// Check if bookmarked by current user
				if (user) {
					const bookmarkedResponse = await fetchApi(
						`/bookmarks/${postId}/check`,
						{
							method: 'GET',
						},
						{
							accessToken: tokens?.accessToken,
							refreshToken: tokens?.refreshToken,
						}
					);
					if (bookmarkedResponse.status === 200) {
						setIsBookmarked(bookmarkedResponse.result.isBookmarked);
					}
				}
			} catch (error) {
				console.error('Error fetching data:', error);
				toast({
					title: 'Lỗi',
					description: 'Đã xảy ra lỗi khi tải dữ liệu.',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		}

		if (postId) {
			fetchData();
		}
	}, [postId, toast, user, tokens]);

	const handleLike = async () => {
		if (!user) {
			toast({
				title: 'Chưa đăng nhập',
				description: 'Vui lòng đăng nhập để thích bài viết.',
				variant: 'destructive',
			});
			return;
		}

		try {
			if (isLiked) {
				const response = await fetchApi(
					`/likes`,
					{
						method: 'DELETE',
						body: JSON.stringify({
							postId: postId,
						}),
					},
					{
						accessToken: tokens?.accessToken,
						refreshToken: tokens?.refreshToken,
					}
				);
				if (response.status === 200) {
					setIsLiked(false);
					setLikesCount((prev) => prev - 1);
				} else {
					toast({
						title: 'Lỗi',
						description: 'Không thể bỏ thích bài viết.',
						variant: 'destructive',
					});
				}
			} else {
				const response = await fetchApi(
					`/likes`,
					{
						method: 'POST',
						body: JSON.stringify({
							postId: postId,
						}),
					},
					{
						accessToken: tokens?.accessToken,
						refreshToken: tokens?.refreshToken,
					}
				);
				if (response.status === 201) {
					setIsLiked(true);
					setLikesCount((prev) => prev + 1);
				} else {
					toast({
						title: 'Lỗi',
						description: 'Không thể thích bài viết.',
						variant: 'destructive',
					});
				}
			}
		} catch (error) {
			console.error('Error liking/unliking post:', error);
			toast({
				title: 'Lỗi',
				description: 'Đã xảy ra lỗi khi thực hiện hành động thích.',
				variant: 'destructive',
			});
		}
	};

	const handleBookmark = async () => {
		if (!user) {
			toast({
				title: 'Chưa đăng nhập',
				description: 'Vui lòng đăng nhập để lưu bài viết.',
				variant: 'destructive',
			});
			return;
		}

		try {
			if (isBookmarked) {
				const response = await fetchApi(
					`/bookmarks`,
					{
						method: 'DELETE',
						body: JSON.stringify({
							postId: postId,
						}),
					},
					{
						accessToken: tokens?.accessToken,
						refreshToken: tokens?.refreshToken,
					}
				);
				if (response.status === 200) {
					setIsBookmarked(false);
					toast({
						title: 'Đã bỏ lưu',
						variant: 'success',
					});
				} else {
					toast({
						title: 'Lỗi',
						description: 'Không thể bỏ lưu bài viết.',
						variant: 'destructive',
					});
				}
			} else {
				const response = await fetchApi(
					`/bookmarks`,
					{
						method: 'POST',
						body: JSON.stringify({
							postId: postId,
						}),
					},
					{
						accessToken: tokens?.accessToken,
						refreshToken: tokens?.refreshToken,
					}
				);
				if (response.status === 201) {
					setIsBookmarked(true);
					toast({
						title: 'Đã lưu bài viết',
						variant: 'success',
					});
				} else {
					toast({
						title: 'Lỗi',
						description: 'Không thể lưu bài viết.',
						variant: 'destructive',
					});
				}
			}
		} catch (error) {
			console.error('Error bookmarking post:', error);
			toast({
				title: 'Lỗi',
				description: 'Đã xảy ra lỗi khi thực hiện hành động lưu bài viết.',
				variant: 'destructive',
			});
		}
	};

	const handleShare = async () => {
		try {
			if (navigator.share) {
				await navigator.share({
					title: post?.title,
					text: post?.title,
					url: window.location.href,
				});
			} else {
				await navigator.clipboard.writeText(window.location.href);
				toast({
					title: 'Đã sao chép liên kết',
					description: 'Liên kết bài viết đã được sao chép vào clipboard',
					variant: 'success',
				});
			}
		} catch (error) {
			console.error('Error sharing post:', error);
			toast({
				title: 'Lỗi',
				description: 'Không thể chia sẻ bài viết.',
				variant: 'destructive',
			});
		}
	};

	const handleSubmitComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim()) return;
		if (!user) {
			toast({
				title: 'Chưa đăng nhập',
				description: 'Vui lòng đăng nhập để bình luận.',
				variant: 'destructive',
			});
			return;
		}

		setSubmittingComment(true);
		try {
			const response = await fetchApi(
				`/comments`,
				{
					method: 'POST',
					body: JSON.stringify({
						postId: postId,
						content: newComment,
					}),
				},
				{
					accessToken: tokens?.accessToken,
					refreshToken: tokens?.refreshToken,
				}
			);

			if (response.status === 201) {
				const newAddedComment = response.result;
				setComments((prev) => [newAddedComment, ...prev]);
				setPost((prev) => (prev ? { ...prev, comments: prev.comments + 1 } : null));
				setNewComment('');
				toast({
					title: 'Đã thêm bình luận',
					variant: 'success',
				});
			} else {
				toast({
					title: 'Lỗi',
					description: 'Không thể thêm bình luận. Vui lòng thử lại.',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error submitting comment:', error);
			toast({
				title: 'Lỗi',
				description: 'Đã xảy ra lỗi khi gửi bình luận.',
				variant: 'destructive',
			});
		} finally {
			setSubmittingComment(false);
		}
	};

	const handleDeletePost = async () => {
		try {
			const response = await fetchApi(
				`/posts/${postId}`,
				{
					method: 'DELETE',
				},
				{
					accessToken: tokens?.accessToken,
					refreshToken: tokens?.refreshToken,
				}
			);

			if (response.status === 200) {
				toast({
					title: 'Bài viết đã được xóa',
					description: 'Bài viết đã được xóa thành công',
					variant: 'success',
				});
				router.push('/posts');
			} else {
				toast({
					title: 'Lỗi',
					description: response.result?.message || 'Không thể xóa bài viết',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error deleting post:', error);
			toast({
				title: 'Lỗi',
				description: 'Đã xảy ra lỗi khi xóa bài viết',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		try {
			const response = await fetchApi(
				`/comments/${commentId}`,
				{
					method: 'DELETE',
				},
				{
					accessToken: tokens?.accessToken,
					refreshToken: tokens?.refreshToken,
				}
			);

			if (response.status === 200) {
				setComments(comments.filter((comment) => comment._id !== commentId));
				toast({
					title: 'Bình luận đã được xóa',
					variant: 'success',
				});
			} else {
				toast({
					title: 'Lỗi',
					description: 'Không thể xóa bình luận',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error deleting comment:', error);
			toast({
				title: 'Lỗi',
				description: 'Đã xảy ra lỗi khi xóa bình luận',
				variant: 'destructive',
			});
		}
	};

	const handleUpdateComment = async (commentId: string, content: string) => {
		try {
			const response = await fetchApi(
				`/comments/${commentId}`,
				{
					method: 'PUT',
					body: JSON.stringify({ content }),
				},
				{
					accessToken: tokens?.accessToken,
					refreshToken: tokens?.refreshToken,
				}
			);

			if (response.status === 200) {
				setComments(
					comments.map((comment) =>
						comment._id === commentId ? { ...comment, content: response.result.content } : comment
					)
				);
				setEditingCommentId(null);
				setEditingContent('');
				toast({
					title: 'Bình luận đã được cập nhật',
					variant: 'success',
				});
			} else {
				toast({
					title: 'Lỗi',
					description: 'Không thể cập nhật bình luận',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error updating comment:', error);
			toast({
				title: 'Lỗi',
				description: 'Đã xảy ra lỗi khi cập nhật bình luận',
				variant: 'destructive',
			});
		}
	};

	const startEditComment = (commentId: string, currentContent: string) => {
		setEditingCommentId(commentId);
		setEditingContent(currentContent);
	};

	const cancelEditComment = () => {
		setEditingCommentId(null);
		setEditingContent('');
	};

	const saveEditComment = async (commentId: string) => {
		if (editingContent.trim()) {
			await handleUpdateComment(commentId, editingContent.trim());
		}
	};

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
				</div>

				<div className="container mx-auto px-4 py-8 relative">
					<div className="max-w-4xl mx-auto space-y-8">
						{/* Header Skeleton */}
						<div className="flex items-center mb-6">
							<Skeleton className="h-10 w-32" />
						</div>

						{/* Hero Image Skeleton */}
						<Skeleton className="aspect-[16/9] w-full rounded-2xl" />

						{/* Title and Meta Skeleton */}
						<div className="space-y-4">
							<Skeleton className="h-12 w-3/4" />
							<div className="flex items-center gap-4">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
						</div>

						{/* Content Skeleton */}
						<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
							<CardContent className="p-8">
								<div className="space-y-4">
									{Array.from({ length: 8 }).map((_, i) => (
										<Skeleton key={i} className="h-4 w-full" />
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
				<Card className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
					<CardContent className="p-8 text-center">
						<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
							<MessageCircle className="w-8 h-8 text-red-500" />
						</div>
						<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
							Không tìm thấy bài viết
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-6">
							Bài viết này không tồn tại hoặc đã bị xóa
						</p>
						<Button
							onClick={() => router.push('/posts')}
							className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
						>
							Quay lại danh sách bài viết
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const attachments = post.attachments || [];
	const hasAttachments = attachments && attachments.length > 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
			</div>

			<div className="container mx-auto px-4 py-8 relative">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
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
							{user && user._id === post.createdBy._id && (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={() => router.push(`/posts/${postId}/edit`)}
										className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
									>
										<Pencil className="h-4 w-4" />
										Chỉnh sửa
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleDeletePost}
										className="gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
									>
										<Trash className="h-4 w-4" />
										Xóa bài viết
									</Button>
								</>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={handleBookmark}
								className={`gap-2 ${
									isBookmarked
										? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200'
										: 'bg-white/50 dark:bg-gray-800/50'
								}`}
							>
								{isBookmarked ? (
									<BookmarkCheck className="h-4 w-4" />
								) : (
									<Bookmark className="h-4 w-4" />
								)}
								{isBookmarked ? 'Đã lưu' : 'Lưu'}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleShare}
								className="gap-2 bg-white/50 dark:bg-gray-800/50"
							>
								<Share2 className="h-4 w-4" />
								Chia sẻ
							</Button>
						</div>
					</div>

					{/* Hero Image */}
					{post.bannerImage && (
						<div className="relative mb-8 overflow-hidden rounded-2xl shadow-2xl">
							<img
								src={`${process.env.NEXT_PUBLIC_API_URL}/${post.bannerImage}`}
								alt={post.title}
								className="aspect-[16/9] w-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
						</div>
					)}

					{/* Post Header */}
					<div className="mb-8">
						{/* Title */}
						<h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight">
							{post.title}
						</h1>

						{/* Author and Meta */}
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="flex items-center gap-4">
								<Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-600">
									<AvatarImage
										src={
											`${process.env.NEXT_PUBLIC_API_URL || '/placeholder.svg'}/${
												post.createdBy.avatar
											}` || '/placeholder.svg'
										}
										alt={post.createdBy.name}
									/>
									<AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
										{post.createdBy.name?.charAt(0) || 'A'}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-semibold text-gray-800 dark:text-gray-100">
										{post.createdBy.name}
									</p>
									<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{formatDate(post.createdAt)}
										</div>
										<div className="flex items-center gap-1">
											<Clock className="h-3 w-3" />5 phút đọc
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
									<span>{post.comments}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Post Content */}
					<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
						<CardContent className="p-8">
							<div
								className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
								dangerouslySetInnerHTML={{ __html: updateSrcImage(post.content) }}
							/>
						</CardContent>
					</Card>

					{/* Attachments Section */}
					{hasAttachments && (
						<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5 text-blue-500" />
									File đính kèm ({attachments.length})
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4">
									{attachments.map((attachment) => (
										<div
											key={attachment._id || attachment.id}
											className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
										>
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
													<FileText className="w-6 h-6 text-white" />
												</div>
												<div>
													<p className="font-medium text-gray-800 dark:text-gray-100">
														{attachment.originalname || attachment.name || 'File đính kèm'}
													</p>
													<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
														<span>{formatBytes(attachment.size || 0)}</span>
														<span>•</span>
														<span>
															{formatDate(
																attachment.createdAt ||
																	attachment.uploadedAt ||
																	new Date().toISOString()
															)}
														</span>
													</div>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
												onClick={() => {
													const link = document.createElement('a');
													link.href = `${process.env.NEXT_PUBLIC_API_URL}/${
														attachment.filename || attachment.path || attachment.url
													}`;
													link.download = attachment.originalname || attachment.name || 'download';
													link.target = '_blank';
													link.click();
												}}
											>
												<Download className="h-4 w-4" />
												Tải xuống
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Action Bar */}
					<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<Button
										variant="outline"
										onClick={handleLike}
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
										{post.comments} Bình luận
									</Button>
								</div>
								<Button variant="outline" onClick={handleShare} className="gap-2">
									<Share2 className="h-4 w-4" />
									Chia sẻ
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Comments Section */}
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
								<form onSubmit={handleSubmitComment} className="space-y-4">
									<div className="flex gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage
												src={
													`${process.env.NEXT_PUBLIC_API_URL || '/placeholder.svg'}/${
														user.avatar
													}` || '/placeholder.svg'
												}
											/>
											<AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<Textarea
												placeholder="Viết bình luận của bạn..."
												value={newComment}
												onChange={(e) => setNewComment(e.target.value)}
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
							)}

							{comments.length > 0 && <Separator />}

							{/* Comments List */}
							<div className="space-y-6">
								{comments.map((comment) => (
									<div key={comment._id} className="flex gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage
												src={
													`${process.env.NEXT_PUBLIC_API_URL || '/placeholder.svg'}/${
														comment.createdBy.avatar
													}` || '/placeholder.svg'
												}
												alt={comment.createdBy.name}
											/>
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
															<span className="text-xs text-gray-400 dark:text-gray-500">
																(đã chỉnh sửa)
															</span>
														)}
													</div>
													{user &&
														user._id === comment.createdBy._id &&
														editingCommentId !== comment._id && (
															<div className="flex gap-1">
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => startEditComment(comment._id, comment.content)}
																	className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
																>
																	<Pencil className="h-3 w-3" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => handleDeleteComment(comment._id)}
																	className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
																>
																	<Trash className="h-3 w-3" />
																</Button>
															</div>
														)}
												</div>

												{editingCommentId === comment._id ? (
													<div className="space-y-3">
														<Textarea
															value={editingContent}
															onChange={(e) => setEditingContent(e.target.value)}
															className="min-h-[60px] resize-none bg-white dark:bg-gray-600"
															placeholder="Sửa bình luận..."
														/>
														<div className="flex gap-2">
															<Button
																size="sm"
																onClick={() => saveEditComment(comment._id)}
																disabled={!editingContent.trim()}
																className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
															>
																<Check className="w-4 h-4 mr-1" />
																Lưu
															</Button>
															<Button size="sm" variant="outline" onClick={cancelEditComment}>
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
												<Button
													variant="ghost"
													size="sm"
													className="text-gray-500 hover:text-blue-600"
												>
													<ThumbsUp className="h-4 w-4 mr-1" />
													Thích
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="text-gray-500 hover:text-blue-600"
												>
													Trả lời
												</Button>
											</div>
										</div>
									</div>
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
				</div>
			</div>
		</div>
	);
}
