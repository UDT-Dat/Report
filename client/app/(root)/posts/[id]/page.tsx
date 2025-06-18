'use client';

import { CommentsSection } from '@/components/post-detail/comments-section';
import { PostActions } from '@/components/post-detail/post-actions';
import { PostAttachments } from '@/components/post-detail/post-attachments';
import { PostContent } from '@/components/post-detail/post-content';
import { PostHeader } from '@/components/post-detail/post-header';
import { PostHero } from '@/components/post-detail/post-hero';
import { PostMeta } from '@/components/post-detail/post-meta';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import type { Comment, Post } from '@/lib/types';
import { MessageCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

export default function PostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const { user, tokens } = useAuth();
	const postId = params.id as string;

	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [isLiked, setIsLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(0);
	// const [isBookmarked, setIsBookmarked] = useState(false);
	const [newComment, setNewComment] = useState('');
	const [submittingComment, setSubmittingComment] = useState(false);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState('');
	const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false);
	const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				// Fetch Post
				const postResponse = await fetchApi(
					`/posts/${postId}`,
					{ method: 'GET' },
					{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
				);
				if (postResponse.status === 200) {
					setPost(postResponse.result);
					setLikesCount(postResponse.result.likes);
				} else {
					toast({
						title: 'Lỗi',
						description: 'Không thể tải bài viết.',
						variant: 'destructive',
					});
					setPost(null);
				}

				// Fetch Comments
				const commentsResponse = await fetchApi(
					`/comments?postId=${postId}`,
					{ method: 'GET' },
					{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
				);
				if (commentsResponse.status === 200) {
					setComments(commentsResponse.result.comments);
				}

				// Check if liked by current user
				if (user) {
					const likedResponse = await fetchApi(
						`/likes/${postId}/check`,
						{ method: 'GET' },
						{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
					);
					if (likedResponse.status === 200) {
						setIsLiked(likedResponse.result.isLiked);
					}
				}

				// Check if bookmarked by current user
				// if (user) {
				// 	const bookmarkedResponse = await fetchApi(
				// 		`/bookmarks/${postId}/check`,
				// 		{ method: 'GET' },
				// 		{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
				// 	);
				// 	if (bookmarkedResponse.status === 200) {
				// 		setIsBookmarked(bookmarkedResponse.result.isBookmarked);
				// 	}
				// }
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
						body: JSON.stringify({ postId: postId }),
					},
					{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
				);
				if (response.status === 200) {
					setIsLiked(false);
					setLikesCount((prev) => prev - 1);
				}
			} else {
				const response = await fetchApi(
					`/likes`,
					{
						method: 'POST',
						body: JSON.stringify({ postId: postId }),
					},
					{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
				);
				if (response.status === 201) {
					setIsLiked(true);
					setLikesCount((prev) => prev + 1);
				}
			}
		} catch (error) {
			console.error('Error liking/unliking post:', error);
		}
	};

	// const handleBookmark = async () => {
	// 	if (!user) {
	// 		toast({
	// 			title: 'Chưa đăng nhập',
	// 			description: 'Vui lòng đăng nhập để lưu bài viết.',
	// 			variant: 'destructive',
	// 		});
	// 		return;
	// 	}

	// 	try {
	// 		if (isBookmarked) {
	// 			const response = await fetchApi(
	// 				`/bookmarks`,
	// 				{
	// 					method: 'DELETE',
	// 					body: JSON.stringify({ postId: postId }),
	// 				},
	// 				{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
	// 			);
	// 			if (response.status === 200) {
	// 				setIsBookmarked(false);
	// 				toast({ title: 'Đã bỏ lưu', variant: 'success' });
	// 			}
	// 		} else {
	// 			const response = await fetchApi(
	// 				`/bookmarks`,
	// 				{
	// 					method: 'POST',
	// 					body: JSON.stringify({ postId: postId }),
	// 				},
	// 				{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
	// 			);
	// 			if (response.status === 201) {
	// 				setIsBookmarked(true);
	// 				toast({ title: 'Đã lưu bài viết', variant: 'success' });
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error('Error bookmarking post:', error);
	// 	}
	// };

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
				{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
			);

			if (response.status === 201) {
				const newAddedComment = response.result;
				setComments((prev) => [newAddedComment, ...prev]);
				setPost((prev) => (prev ? { ...prev, comments: prev.comments + 1 } : null));
				setNewComment('');
				toast({ title: 'Đã thêm bình luận', variant: 'success' });
			}
		} catch (error) {
			console.error('Error submitting comment:', error);
		} finally {
			setSubmittingComment(false);
		}
	};

	const handleDeletePost = async () => {
		try {
			const response = await fetchApi(
				`/posts/${postId}`,
				{ method: 'DELETE' },
				{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
			);

			if (response.status === 200) {
				setDeletePostDialogOpen(false);
				toast({
					title: 'Bài viết đã được xóa',
					description: 'Bài viết đã được xóa thành công',
					variant: 'success',
				});
				router.push('/posts');
			}
		} catch (error) {
			console.error('Error deleting post:', error);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		try {
			const response = await fetchApi(
				`/comments/${commentId}`,
				{ method: 'DELETE' },
				{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
			);

			if (response.status === 200) {
				setComments(comments.filter((comment) => comment._id !== commentId));
				toast({ title: 'Bình luận đã được xóa', variant: 'success' });
			}
		} catch (error) {
			console.error('Error deleting comment:', error);
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
				{ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken }
			);

			if (response.status === 200) {
				setComments(
					comments.map((comment) =>
						comment._id === commentId ? { ...comment, content: response.result.content } : comment
					)
				);
				setEditingCommentId(null);
				setEditingContent('');
				toast({ title: 'Bình luận đã được cập nhật', variant: 'success' });
			}
		} catch (error) {
			console.error('Error updating comment:', error);
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

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
				</div>
				<div className="container mx-auto px-4 py-8 relative">
					<div className="max-w-4xl mx-auto space-y-8">
						<div className="flex items-center mb-6">
							<Skeleton className="h-10 w-32" />
						</div>
						<Skeleton className="aspect-[16/9] w-full rounded-2xl" />
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

	const isAuthor = user && user._id === post.createdBy._id;

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
					<PostHeader
						isAuthor={!!isAuthor}
						postId={postId}
						postTitle={post.title}
						// isBookmarked={isBookmarked}
						deletePostDialogOpen={deletePostDialogOpen}
						setDeletePostDialogOpen={setDeletePostDialogOpen}
						// onBookmark={handleBookmark}
						onShare={handleShare}
						onDeletePost={handleDeletePost}
					/>

					<PostHero bannerImage={post.bannerImage} title={post.title} />

					<PostMeta
						author={post.createdBy}
						createdAt={post.createdAt}
						likesCount={likesCount}
						commentsCount={post.comments}
						content={post.content}
					/>

					<PostContent content={post.content} />

					<PostAttachments attachments={post.attachments || []} />

					<PostActions
						isLiked={isLiked}
						likesCount={likesCount}
						commentsCount={post.comments}
						onLike={handleLike}
						onShare={handleShare}
					/>

					<CommentsSection
						comments={comments}
						user={user}
						newComment={newComment}
						submittingComment={submittingComment}
						editingCommentId={editingCommentId}
						editingContent={editingContent}
						deleteCommentDialogOpen={deleteCommentDialogOpen}
						setDeleteCommentDialogOpen={setDeleteCommentDialogOpen}
						onCommentChange={setNewComment}
						onSubmitComment={handleSubmitComment}
						onStartEditComment={startEditComment}
						onCancelEditComment={cancelEditComment}
						onSaveEditComment={saveEditComment}
						onEditContentChange={setEditingContent}
						onDeleteComment={handleDeleteComment}
					/>
				</div>
			</div>
		</div>
	);
}
