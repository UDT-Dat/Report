'use client';

import PaginationClient from '@/components/pagination/PaginationClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-provider';
import { parseImageUrl } from '@/lib/parseImageUrl';
import { eventService } from '@/lib/services/eventService';
import type { Event, User as UserType } from '@/lib/types';
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Download,
	FileText,
	Loader2,
	Mail,
	MapPin,
	Phone,
	Search,
	Share2,
	User,
	Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

interface ParticipantResponse {
	participants: UserType[];
	pagination: {
		total: number;
		page: number;
		limit: number;
	};
}

export default function EventDetailPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as string;

	const [event, setEvent] = useState<Event | null>(null);
	const [participants, setParticipants] = useState<UserType[]>([]);
	const [loading, setLoading] = useState(true);
	const { tokens } = useAuth();
	const [participantsLoading, setParticipantsLoading] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState('');
	const [activeTab, setActiveTab] = useState('details');
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
	});

	// Fetch event details
	const fetchEvent = async () => {
		try {
			setLoading(true);
			const eventData = await eventService.getEvent(eventId);
			setEvent(eventData);
		} catch (error) {
			console.error('Error fetching event:', error);
			toast.error('Không thể tải thông tin sự kiện', {
				duration: 2000,
			});
		} finally {
			setLoading(false);
		}
	};

	// Fetch participants
	const fetchParticipants = async () => {
		try {
			setParticipantsLoading(true);
			const response = await eventService.getEventParticipants(eventId, filters, tokens);
			setParticipants(response.participants);
			setTotal(response.pagination.total);
		} catch (error) {
			console.error('Error fetching participants:', error);
			toast.error('Không thể tải danh sách người tham gia', {
				duration: 2000,
			});
		} finally {
			setParticipantsLoading(false);
		}
	};

	useEffect(() => {
		if (eventId) {
			fetchEvent();
		}
	}, [eventId]);

	useEffect(() => {
		if (eventId && activeTab === 'participants') {
			fetchParticipants();
		}
	}, [eventId, filters, activeTab]);

	// Get event status
	const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'past' | 'cancelled' => {
		const now = new Date();
		const startDate = new Date(event.startDate);
		const endDate = new Date(event.endDate);

		if (event.status === 'cancelled') return 'cancelled';
		if (startDate > now) return 'upcoming';
		if (startDate <= now && endDate >= now) return 'ongoing';
		return 'past';
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		const statusConfig = {
			upcoming: { label: 'Sắp diễn ra', variant: 'success' },
			ongoing: { label: 'Đang diễn ra', variant: 'default' },
			past: { label: 'Đã kết thúc', variant: 'secondary' },
			cancelled: { label: 'Đã hủy', variant: 'destructive' },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.past;

		return (
			<Badge variant={config.variant as any} className="text-sm font-medium">
				{config.label}
			</Badge>
		);
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Handle search
	const handleSearch = useDebouncedCallback((value: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			search: value,
		}));
	}, 500);

	// Helper function to handle blob responses from API
	const fetchApiBlob = async (url: string, options: any = {}, tokens: any) => {
		try {
			const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
			const fullUrl = `${baseUrl}/api${url}`;

			const response = await fetch(fullUrl, {
				...options,
				headers: {
					...options.headers,
					Authorization: `Bearer ${tokens?.accessToken}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return {
					status: response.status,
					result: errorData,
					blob: null,
				};
			}

			const blob = await response.blob();
			return {
				status: response.status,
				blob,
				result: null,
			};
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	};

	// Export participants to Excel
	const exportToExcel = async () => {
		try {
			setExportLoading(true);

			// Prepare export parameters based on current filters
			const exportParams = {
				search: filters.search,
			};

			// Remove undefined values
			const cleanParams = Object.fromEntries(
				Object.entries(exportParams).filter(([_, value]) => value !== undefined)
			);

			// Create query string
			const queryString = new URLSearchParams(cleanParams).toString();
			const url = `/events/${eventId}/participants/export${queryString ? `?${queryString}` : ''}`;

			// Call the API to get the Excel file
			const response = await fetchApiBlob(
				url,
				{
					method: 'GET',
					headers: {
						Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					},
				},
				tokens
			);

			if (!response || response.status !== 200 || !response.blob) {
				throw new Error(response?.result?.message || 'Không thể xuất dữ liệu');
			}

			// Create download link
			const downloadUrl = window.URL.createObjectURL(response.blob);
			const link = document.createElement('a');
			link.href = downloadUrl;

			// Generate filename with event name and current date
			const eventName = event?.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'su-kien';
			const currentDate = new Date().toISOString().split('T')[0];
			link.download = `danh-sach-tham-gia-${eventName}-${currentDate}.xlsx`;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the URL object
			window.URL.revokeObjectURL(downloadUrl);

			toast.success('Xuất dữ liệu thành công', {
				description: 'Danh sách người tham gia đã được xuất ra file Excel',
				duration: 3000,
			});
		} catch (error) {
			console.error('Error exporting participants:', error);
			toast.error('Có lỗi xảy ra khi xuất dữ liệu', {
				description: error instanceof Error ? error.message : 'Vui lòng thử lại sau',
				duration: 3000,
			});
		} finally {
			setExportLoading(false);
		}
	};

	// Share event
	const shareEvent = () => {
		if (navigator.share) {
			navigator
				.share({
					title: event?.title,
					text: event?.description,
					url: window.location.href,
				})
				.then(() => console.log('Shared successfully'))
				.catch((error) => console.log('Error sharing:', error));
		} else {
			// Fallback for browsers that don't support the Web Share API
			navigator.clipboard.writeText(window.location.href);
			toast.success('Đã sao chép liên kết sự kiện', {
				duration: 2000,
			});
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 space-y-8">
				<div className="flex items-center mb-4">
					<Button variant="ghost" disabled className="mr-2">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại
					</Button>
				</div>

				<div className="flex flex-col md:flex-row gap-6">
					<div className="flex-1 space-y-4">
						<Skeleton className="h-10 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<div className="flex flex-wrap gap-4 mt-4">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-6 w-40" />
						</div>
						<Skeleton className="h-8 w-24 mt-2" />
					</div>
					<Skeleton className="w-full md:w-80 h-48" />
				</div>

				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex items-center space-x-4">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="space-y-2 flex-1">
										<Skeleton className="h-4 w-[200px]" />
										<Skeleton className="h-4 w-[150px]" />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="container mx-auto p-6">
				<Button variant="ghost" onClick={() => router.back()} className="mb-6">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại
				</Button>

				<Alert variant="destructive" className="max-w-2xl mx-auto">
					<AlertCircle className="h-5 w-5" />
					<AlertTitle>Không tìm thấy sự kiện</AlertTitle>
					<AlertDescription>
						Sự kiện này không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn hoặc quay lại
						trang trước.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const status = getEventStatus(event);
	const participantCount = Array.isArray(event.participants) ? event.participants.length : 0;

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<Button variant="ghost" onClick={() => router.back()} className="gap-2">
					<ArrowLeft className="h-4 w-4" />
					Quay lại
				</Button>

				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={shareEvent} className="gap-2">
						<Share2 className="h-4 w-4" />
						Chia sẻ
					</Button>
					{activeTab === 'participants' && participants.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={exportToExcel}
							disabled={exportLoading || participants.length === 0}
							className="gap-2"
						>
							{exportLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Đang xuất...
								</>
							) : (
								<>
									<Download className="h-4 w-4" />
									Xuất Excel
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Event Header Card */}
			<Card className="border-t-4 border-t-primary overflow-hidden">
				<CardHeader className="pb-2">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
						<div>
							<div className="flex items-center gap-2 mb-2">{getStatusBadge(status)}</div>
							<CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
							<CardDescription className="text-base mt-2">
								{event.description.replace(/<[^>]*>/g, '').slice(0, 150)}
								{event.description.length > 150 ? '...' : ''}
							</CardDescription>
						</div>

						{event.imageUrl && (
							<div className="w-full md:w-80 shrink-0">
								<img
									src={parseImageUrl(event.imageUrl)}
									alt={event.title}
									className="w-full h-48 object-cover rounded-lg border shadow-sm"
								/>
							</div>
						)}
					</div>
				</CardHeader>

				<CardContent className="pt-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex items-center p-3 rounded-lg bg-muted/50">
							<Calendar className="h-5 w-5 text-primary mr-3" />
							<div>
								<div className="text-sm font-medium">Thời gian</div>
								<div className="text-sm text-muted-foreground">
									{formatDate(event.startDate)} - {formatDate(event.endDate)}
								</div>
							</div>
						</div>

						<div className="flex items-center p-3 rounded-lg bg-muted/50">
							<MapPin className="h-5 w-5 text-primary mr-3" />
							<div>
								<div className="text-sm font-medium">Địa điểm</div>
								<div className="text-sm text-muted-foreground">{event.location}</div>
							</div>
						</div>

						<div className="flex items-center p-3 rounded-lg bg-muted/50">
							<Users className="h-5 w-5 text-primary mr-3" />
							<div>
								<div className="text-sm font-medium">Người tham gia</div>
								<div className="text-sm text-muted-foreground">
									{participantCount}
									{event.maxParticipants && ` / ${event.maxParticipants}`} người
								</div>
							</div>
						</div>
					</div>

					{/* {event.organizer && (
						<div className="mt-6 flex items-center">
							<Avatar className="h-10 w-10 mr-3">
								<AvatarImage
									src={
										event.organizer.avatar
											? `${process.env.NEXT_PUBLIC_API_URL}/${event.organizer.avatar}`
											: undefined
									}
									alt={event.organizer.name}
								/>
								<AvatarFallback>{event.organizer.name?.charAt(0) || 'O'}</AvatarFallback>
							</Avatar>
							<div>
								<div className="text-sm text-muted-foreground">Người tổ chức</div>
								<div className="font-medium">{event.organizer.name}</div>
							</div>
						</div>
					)} */}
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs
				defaultValue="details"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="grid grid-cols-2 md:w-[400px]">
					<TabsTrigger value="details" className="flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Chi tiết
					</TabsTrigger>
					<TabsTrigger value="participants" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Người tham gia ({total})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="mt-6 space-y-6">
					{event.description && (
						<Card>
							<CardHeader>
								<CardTitle className="text-xl">Nội dung sự kiện</CardTitle>
							</CardHeader>
							<CardContent>
								<div
									className="prose prose-sm max-w-none dark:prose-invert"
									dangerouslySetInnerHTML={{ __html: event.description }}
								/>
							</CardContent>
						</Card>
					)}

					{/* {event.schedule && event.schedule.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-xl flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Lịch trình
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{event.schedule.map((item, index) => (
										<div key={index} className="relative pl-6 pb-4">
											{index !== event.schedule.length - 1 && (
												<div className="absolute left-2 top-2 bottom-0 w-0.5 bg-border" />
											)}
											<div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary" />
											<div className="font-medium">{item.time}</div>
											<div className="text-muted-foreground">{item.activity}</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)} */}

					{/* Additional event details can be added here */}
				</TabsContent>

				<TabsContent value="participants" className="mt-6">
					<Card>
						<CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
							<div>
								<CardTitle className="flex items-center">
									<Users className="mr-2 h-5 w-5" />
									Danh sách người tham gia
								</CardTitle>
								<CardDescription>Tổng cộng {total} người tham gia</CardDescription>
							</div>
							<div className="flex flex-col sm:flex-row gap-3">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Tìm kiếm người tham gia..."
										className="pl-8 w-full md:w-64"
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											handleSearch(e.target.value);
										}}
									/>
								</div>
								{participants.length > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={exportToExcel}
										disabled={exportLoading}
										className="gap-2 h-10"
									>
										{exportLoading ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Đang xuất...
											</>
										) : (
											<>
												<Download className="h-4 w-4" />
												Xuất danh sách
											</>
										)}
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{participantsLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<span className="ml-2">Đang tải danh sách người tham gia...</span>
								</div>
							) : participants.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
									<Users className="h-16 w-16 mb-4 opacity-20" />
									<p className="text-lg font-medium mb-1">
										{filters.search
											? 'Không tìm thấy người tham gia nào'
											: 'Chưa có người tham gia nào'}
									</p>
									<p className="text-sm">
										{filters.search
											? 'Thử tìm kiếm với từ khóa khác'
											: 'Người tham gia sự kiện sẽ xuất hiện ở đây'}
									</p>
									{filters.search && (
										<Button
											variant="ghost"
											className="mt-4"
											onClick={() => {
												setSearch('');
												setFilters((prev) => ({ ...prev, search: '', page: 1 }));
											}}
										>
											Xóa bộ lọc
										</Button>
									)}
								</div>
							) : (
								<>
									<div className="rounded-md border overflow-hidden">
										<Table>
											<TableHeader>
												<TableRow className="bg-muted/50">
													<TableHead>Tên</TableHead>
													<TableHead>Email</TableHead>
													<TableHead>Số điện thoại</TableHead>
													<TableHead className="hidden md:table-cell">Địa chỉ</TableHead>
													<TableHead>Vai trò</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{participants.map((participant) => {
													let badgeVariant: 'destructive' | 'default' | 'secondary';
													let badgeLabel: string;
													if (participant.role === 'admin') {
														badgeVariant = 'destructive';
														badgeLabel = 'Quản trị viên';
													} else if (participant.role === 'bod') {
														badgeVariant = 'default';
														badgeLabel = 'Ban chủ nhiệm';
													} else {
														badgeVariant = 'secondary';
														badgeLabel = 'Thành viên';
													}
													return (
														<TableRow key={participant._id} className="hover:bg-muted/50">
															<TableCell className="font-medium">
																<div className="flex items-center">
																	<Avatar className="h-8 w-8 mr-3">
																		<AvatarImage
																			src={
																				participant.avatar
																					? parseImageUrl(participant.avatar)
																					: undefined
																			}
																			alt={participant.name}
																		/>
																		<AvatarFallback className="bg-primary/10">
																			<User className="h-4 w-4 text-primary" />
																		</AvatarFallback>
																	</Avatar>
																	<span className="truncate max-w-[180px]">{participant.name}</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center">
																	<Mail className="mr-2 h-4 w-4 text-muted-foreground" />
																	<span className="truncate max-w-[180px]">
																		{participant.email}
																	</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center">
																	<Phone className="mr-2 h-4 w-4 text-muted-foreground" />
																	<span>{participant.phone || 'Chưa cập nhật'}</span>
																</div>
															</TableCell>
															<TableCell className="hidden md:table-cell">
																<span className="truncate max-w-[200px] block">
																	{participant.address || 'Chưa cập nhật'}
																</span>
															</TableCell>
															<TableCell>
																<Badge variant={badgeVariant}>{badgeLabel}</Badge>
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>

									<div className="mt-6">
										<PaginationClient
											total={total}
											filter={{ page: filters.page, limit: filters.limit }}
											setFilter={(newFilter) => setFilters((prev) => ({ ...prev, ...newFilter }))}
										/>
									</div>
								</>
							)}
						</CardContent>
						<CardFooter className="flex justify-between border-t pt-6">
							<div className="text-sm text-muted-foreground">
								Hiển thị {participants.length} trên tổng số {total} người tham gia
							</div>
							{participants.length > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={exportToExcel}
									disabled={exportLoading}
									className="gap-2"
								>
									{exportLoading ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Đang xuất...
										</>
									) : (
										<>
											<Download className="h-4 w-4" />
											Xuất Excel
										</>
									)}
								</Button>
							)}
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
