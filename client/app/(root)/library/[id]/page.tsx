'use client';

import { use, useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/constants';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { parseImageUrl, parseUrl } from '@/lib/parseImageUrl';
import { Attachment, LibraryItem } from '@/lib/types';
import { cn, formatBytes, formatDate } from '@/lib/utils';
import {
	Download,
	File,
	FileAudio,
	FileText,
	ImageIcon,
	Loader2,
	Search,
	Trash,
	Upload,
	Video,
	X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const getFileCategory = (mimeType: string): 'document' | 'image' | 'video' | 'audio' | 'other' => {
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.startsWith('audio/')) return 'audio';
	if (
		[
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'text/plain',
		].includes(mimeType)
	)
		return 'document';

	return 'other';
};

const getFileIcon = (type: string) => {
	switch (type) {
		case 'document':
			return <FileText className="h-6 w-6 text-blue-500" />;
		case 'image':
			return <ImageIcon className="h-6 w-6 text-green-500" />;
		case 'video':
			return <Video className="h-6 w-6 text-red-500" />;
		case 'audio':
			return <FileAudio className="h-6 w-6 text-purple-500" />;
		default:
			return <File className="h-6 w-6 text-gray-500" />;
	}
};
const fileTypes = [
	{
		label: 'Tất cả',
		value: undefined,
	},
	{
		label: 'Tài liệu',
		value: 'document',
	},
	{
		label: 'Hình ảnh',
		value: 'image',
	},
	{
		label: 'Video',
		value: 'video',
	},
	{
		label: 'Audio',
		value: 'audio',
	},
];

export default function LibraryPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ fileType: string }>;
}) {
	const { tokens, user } = useAuth();
	const { id } = use(params);
	const { fileType } = use(searchParams);
	const router = useRouter();
	const { toast } = useToast();
	const [searchQuery, setSearchQuery] = useState('');
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [loading, setLoading] = useState(true);
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
	const [uploading, setUploading] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const [library, setLibrary] = useState<LibraryItem | null>(null);

	const getAttachments = async ({ fileType }: { fileType: string }) => {
		setLoading(true);
		const query = fileType ? `?fileType=${fileType}&page=1&limit=1000` : '?page=1&limit=1000';
		const response = await fetchApi(
			`/library/${id}/attachments${query}`,
			{
				method: 'GET',
			},
			{
				accessToken: tokens?.accessToken,
				refreshToken: tokens?.refreshToken,
			}
		);
		if (response.status === 200) {
			setAttachments(response.result.attachments as Attachment[]);
			setLibrary(response.result.library as LibraryItem);
		}
		if (response.status === 403) {
			toast({
				title: 'Bạn không có quyền truy cập vào thư viện này',
				description: 'Vui lòng liên hệ quản trị viên để được hỗ trợ',
				variant: 'destructive',
			});
			router.push('/library');
		}
		setLoading(false);
	};

	useEffect(() => {
		getAttachments({ fileType }).finally(() => {
			setLoading(false);
		});
	}, [fileType]);

	const handleDelete = async (id: string) => {
		const response = await fetchApi(
			`/library/attachments/${id}`,
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
				title: 'Đã xóa tài liệu thành công',
				description: 'Tài liệu đã được xóa khỏi thư viện',
				variant: 'success',
			});
			setAttachments(attachments.filter((item) => item._id !== id));
		} else {
			toast({
				title: 'Đã xảy ra lỗi khi xóa tài liệu',
				description: 'Vui lòng thử lại sau',
				variant: 'destructive',
			});
		}
	};

	const handleUpload = async () => {
		if (!selectedFiles || selectedFiles.length === 0) {
			toast({
				title: 'Vui lòng chọn tài liệu',
				description: 'Bạn cần chọn ít nhất một tài liệu để tải lên',
				variant: 'destructive',
			});
			return;
		}

		setUploading(true);
		try {
			const formData = new FormData();
			Array.from(selectedFiles).forEach((file) => {
				formData.append('files', file);
			});

			const response = await fetchApi(
				`/library/${id}/attachments`,
				{
					method: 'POST',
					body: formData,
				},
				{
					accessToken: tokens?.accessToken,
					refreshToken: tokens?.refreshToken,
				}
			);

			if (response.status === 201) {
				toast({
					title: 'Tải lên thành công',
					description: 'Tài liệu đã được tải lên thư viện',
					variant: 'success',
				});
				// Refresh attachments list
				await getAttachments({ fileType });
				setOpenDialog(false);
				setSelectedFiles(null);
			} else {
				toast({
					title: 'Đã xảy ra lỗi khi tải lên',
					description: response.result?.message || 'Vui lòng thử lại sau',
					variant: 'destructive',
				});
			}
		} catch {
			toast({
				title: 'Đã xảy ra lỗi khi tải lên',
				description: 'Vui lòng thử lại sau',
				variant: 'destructive',
			});
		} finally {
			setUploading(false);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			setSelectedFiles(files);
		}
	};

	const removeFile = (indexToRemove: number) => {
		if (selectedFiles) {
			const dt = new DataTransfer();
			Array.from(selectedFiles).forEach((file, index) => {
				if (index !== indexToRemove) {
					dt.items.add(file);
				}
			});
			setSelectedFiles(dt.files.length > 0 ? dt.files : null);
		}
	};
	function canDelete(item: Attachment) {
		return (
			item.uploadedBy?._id === user?._id ||
			user?.role === UserRole.ADMIN ||
			library?.createdBy?._id === user?._id
		);
	}

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-10 w-10 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Thư viện tài liệu</h1>
				<p className="text-gray-500 dark:text-white">
					Kho tài liệu, hình ảnh, video và tài nguyên của CLB IT VLU
				</p>
			</div>

			<div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
					<Input
						type="search"
						placeholder="Tìm kiếm tài liệu..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex space-x-2">
					<Button className="flex-shrink-0" onClick={() => setOpenDialog(true)}>
						<Upload className="mr-2 h-4 w-4" />
						Tải lên tài liệu mới
					</Button>
				</div>
			</div>

			<div className="inline-flex w-auto gap-2 bg-gray-200 p-2 rounded-md mb-6">
				{fileTypes.map((item) => (
					<Button
						variant="outline"
						size="sm"
						key={item.label}
						className={cn(
							'flex-shrink-0',
							item.value === fileType
								? 'bg-primary text-primary-foreground hover:bg-primary/90'
								: 'bg-background text-foreground hover:bg-primary/70 hover:text-white'
						)}
						onClick={() =>
							router.push(`/library/${id}?${item.value ? `fileType=${item.value}` : ''}`)
						}
					>
						{item.label}
					</Button>
				))}
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{attachments?.map((item) => (
					<Card key={item._id} className="overflow-hidden">
						<div className="relative aspect-video w-full overflow-hidden bg-gray-100">
							{/* if fileType is image, show image */}
							{item.fileType.includes('image') ? (
								<>
									<Image
										src={parseImageUrl(item.url)}
										alt={item.originalname}
										fill
										className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105"
									/>
									<div className="absolute left-2 top-2 rounded-full bg-white p-1.5 shadow-sm">
										{getFileIcon(getFileCategory(item.fileType))}
									</div>
								</>
							) : (
								<div className="absolute left-2 top-2 rounded-full bg-white p-1.5 shadow-sm">
									{getFileIcon(getFileCategory(item.fileType))}
								</div>
							)}
							{canDelete(item) && (
								<button
									type="button"
									className="ml-auto size-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 z-50 absolute top-2 right-2 focus:outline-none focus:ring-2 focus:ring-red-400"
									onClick={() => handleDelete(item._id)}
									aria-label="Xóa tài liệu"
									tabIndex={0}
								>
									<Trash className="h-4 w-4 text-white" />
								</button>
							)}
						</div>
						<CardContent className="space-y-2 p-4 relative">
							<h3 className="mb-1 font-medium line-clamp-2">{item.originalname}</h3>
							<Separator />
							<div className="mb-3 flex gap-1 items-center">
								<Avatar>
									<AvatarImage src={parseImageUrl(item.uploadedBy?.avatar)} />
									<AvatarFallback>{item.uploadedBy?.name.charAt(0) || 'U'}</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm text-gray-500 font-medium">
										{item.uploadedBy?.name || 'Người dùng không tồn tại'}
									</p>
									<p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
								</div>
							</div>
							<div className="mb-3 flex items-center justify-between text-xs text-gray-500">
								<span>{formatBytes(item.size)}</span>
							</div>
							<div className="flex space-x-2">
								<Button
									variant="default"
									className="w-full"
									onClick={async () => {
										try {
											const url = parseUrl(item.url);

											const response = await fetch(url);
											if (!response.ok) throw new Error('Fetch failed');
											const blob = await response.blob();

											const downloadUrl = window.URL.createObjectURL(blob);
											const a = document.createElement('a');
											a.href = downloadUrl;
											a.download = item.originalname || 'download';
											document.body.appendChild(a);
											a.click();
											a.remove();
											window.URL.revokeObjectURL(downloadUrl);
										} catch {
											toast({
												title: 'Lỗi tải xuống',
												description: 'Không thể tải xuống tệp. Vui lòng thử lại.',
												variant: 'destructive',
											});
										}
									}}
								>
									<Download className="mr-2 h-4 w-4" />
									Tải xuống
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{attachments.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<Search className="mb-4 h-12 w-12 text-gray-300" />
					<h3 className="mb-2 text-lg font-medium">Không tìm thấy tài liệu</h3>
					<p className="text-gray-500">
						Không tìm thấy tài liệu phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với từ
						khóa khác.
					</p>
				</div>
			)}

			<Dialog open={openDialog} onOpenChange={setOpenDialog}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Tải lên tài liệu</DialogTitle>
						<DialogDescription>
							Chọn tài liệu để tải lên thư viện. Hỗ trợ các định dạng: PDF, Word, Excel, PowerPoint,
							hình ảnh, video, audio.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div
							className={cn(
								'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
								isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
								'hover:border-primary hover:bg-primary/5 cursor-pointer'
							)}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => document.getElementById('file')?.click()}
						>
							<Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
							<p className="text-sm font-medium mb-1">Kéo thả tệp vào đây hoặc nhấp để chọn</p>
							<p className="text-xs text-muted-foreground">Hỗ trợ tối đa 5 tệp cùng lúc</p>
							<Input
								id="file"
								type="file"
								multiple
								accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.mp3,.wav,.m4a"
								onChange={(e) => setSelectedFiles(e.target.files)}
								className="hidden"
							/>
						</div>

						{selectedFiles && selectedFiles.length > 0 && (
							<div className="space-y-2">
								<Label className="text-sm font-medium">Tệp đã chọn:</Label>
								<div className="max-h-32 overflow-y-auto space-y-2">
									{Array.from(selectedFiles).map((file, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 bg-muted rounded-md"
										>
											<div className="flex items-center space-x-2">
												{getFileIcon(getFileCategory(file.type))}
												<div>
													<p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
													<p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
												</div>
											</div>
											<div
												className="size-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
												onClick={() => removeFile(index)}
											>
												<X className="h-4 w-4 text-white" />
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setOpenDialog(false);
								setSelectedFiles(null);
								setIsDragOver(false);
							}}
						>
							Hủy
						</Button>
						<Button
							type="submit"
							onClick={handleUpload}
							disabled={uploading || !selectedFiles || selectedFiles.length === 0}
						>
							{uploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Đang tải lên...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Tải lên ({selectedFiles?.length || 0})
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
