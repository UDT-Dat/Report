'use client';

import { useEffect, useState } from 'react';

import { AlertCircle, Edit, Eye, Filter, Loader2, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import EventModal from '@/components/EventModal';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/lib/auth-provider';
import {
	CreateEventData,
	EventFilters,
	eventService,
	UpdateEventData,
} from '@/lib/services/eventService';
import { Event } from '@/lib/types';

export default function EventsManagementPage() {
	const router = useRouter();
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const { tokens } = useAuth();
	const [filters, setFilters] = useState<EventFilters>({
		page: 1,
		limit: 10,
		title: '',
		location: '',
		status: undefined,
	});

	// Modal states
	const [isEventModalOpen, setIsEventModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [search, setSearch] = useState('');
	// Delete confirmation
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

	// Fetch events
	const fetchEvents = async () => {
		try {
			setLoading(true);
			const response = await eventService.getEvents(filters);
			setEvents(response.events);
			setTotal(response.pagination.total);
		} catch (error) {
			console.error('Error fetching events:', error);
			toast.error('Không thể tải danh sách sự kiện', {
				duration: 2000,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, [filters]);

	// Get event status
	const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'past' | 'cancelled' => {
		const now = new Date();
		const startDate = new Date(event.startDate);
		const endDate = new Date(event.endDate);

		if (startDate > now) return 'upcoming';
		if (startDate <= now && endDate >= now) return 'ongoing';
		return 'past';
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		const statusConfig = {
			upcoming: { label: 'Sắp diễn ra', className: 'bg-green-50 text-green-700' },
			ongoing: { label: 'Đang diễn ra', className: 'bg-blue-50 text-blue-700' },
			past: { label: 'Đã kết thúc', className: 'bg-gray-50 text-gray-700' },
			cancelled: { label: 'Đã hủy', className: 'bg-red-50 text-red-700' },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.past;

		return (
			<Badge variant="outline" className={config.className}>
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

	// Handle filter change
	const handleFilterChange = (status: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			status: status === 'all' ? undefined : (status as any),
		}));
	};

	// Handle create event
	const handleCreateEvent = () => {
		setSelectedEvent(null);
		setIsEventModalOpen(true);
	};

	// Handle edit event
	const handleEditEvent = (event: Event) => {
		setSelectedEvent(event);
		setIsEventModalOpen(true);
	};

	// Handle view event details
	const handleViewEvent = (event: Event) => {
		router.push(`/dashboard/bod/events/${event._id}`);
	};

	// Handle submit event (create/update)
	const handleSubmitEvent = async (data: CreateEventData | UpdateEventData) => {
		try {
			setIsSubmitting(true);

			if (selectedEvent) {
				// Update event
				await eventService.updateEvent(selectedEvent._id, data, tokens);
				toast.success('Cập nhật sự kiện thành công!', {
					duration: 2000,
				});
			} else {
				// Create event
				await eventService.createEvent(data as CreateEventData, tokens);
				toast.success('Tạo sự kiện thành công!', {
					duration: 2000,
				});
			}

			setIsEventModalOpen(false);
			setSelectedEvent(null);
			fetchEvents();
		} catch (error) {
			console.error('Error submitting event:', error);
			toast.error(selectedEvent ? 'Không thể cập nhật sự kiện' : 'Không thể tạo sự kiện', {
				duration: 2000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle delete event
	const handleDeleteEvent = (event: Event) => {
		setEventToDelete(event);
		setDeleteDialogOpen(true);
	};

	const confirmDeleteEvent = async () => {
		if (!eventToDelete) return;

		try {
			await eventService.deleteEvent(eventToDelete._id, tokens);
			toast.success('Xóa sự kiện thành công!', {
				duration: 2000,
			});
			setDeleteDialogOpen(false);
			setEventToDelete(null);
			fetchEvents();
		} catch (error) {
			console.error('Error deleting event:', error);
			toast.error('Không thể xóa sự kiện', {
				duration: 2000,
			});
		}
	};
	const handleSearch = useDebouncedCallback((value: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			title: value,
		}));
	}, 500);

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
				<p className="text-gray-500">Quản lý tất cả sự kiện của CLB IT VLU</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
						<div>
							<CardTitle>Danh sách sự kiện</CardTitle>
							<CardDescription>Tổng cộng {total} sự kiện</CardDescription>
						</div>
						<div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
								<Input
									type="search"
									placeholder="Tìm kiếm sự kiện..."
									className="pl-8"
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										handleSearch(e.target.value);
									}}
								/>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										<Filter className="mr-2 h-4 w-4" />
										Lọc
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => handleFilterChange('all')}>
										Tất cả
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleFilterChange('upcoming')}>
										Sắp diễn ra
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleFilterChange('ongoing')}>
										Đang diễn ra
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleFilterChange('past')}>
										Đã kết thúc
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button onClick={handleCreateEvent}>
								<PlusCircle className="mr-2 h-4 w-4" />
								Tạo sự kiện mới
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
							<span className="ml-2">Đang tải...</span>
						</div>
					) : events?.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-gray-500">
							<AlertCircle className="h-12 w-12 mb-4" />
							<p>Không có sự kiện nào</p>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Tên sự kiện</TableHead>
										<TableHead>Ngày bắt đầu</TableHead>
										<TableHead>Ngày kết thúc</TableHead>
										<TableHead>Địa điểm</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Người tham dự</TableHead>
										<TableHead className="text-right">Thao tác</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{events?.map((event) => {
										const status = getEventStatus(event);
										const participantCount = Array.isArray(event.participants)
											? event.participants.length
											: 0;

										return (
											<TableRow key={event._id}>
												<TableCell className="font-medium">{event.title}</TableCell>
												<TableCell>{formatDate(event.startDate)}</TableCell>
												<TableCell>{formatDate(event.endDate)}</TableCell>
												<TableCell>{event.location}</TableCell>
												<TableCell>
													<span className="inline-block w-max">{getStatusBadge(status)}</span>
												</TableCell>
												<TableCell>
													<div className="flex items-center">
														<span>
															{participantCount}
															{event.maxParticipants && `/${event.maxParticipants}`}
														</span>
														{event.maxParticipants && (
															<div className="ml-2 h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
																<div
																	className="h-full rounded-full bg-blue-600"
																	style={{
																		width: `${Math.min(
																			(participantCount / event.maxParticipants) * 100,
																			100
																		)}%`,
																	}}
																/>
															</div>
														)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-end justify-end gap-2">
														<Button
															size={'icon'}
															onClick={() => handleViewEvent(event)}
															className="bg-green-600 hover:bg-green-700 flex items-center justify-center"
														>
															<Eye className="h-4 w-4" />
														</Button>
														<Button
															size={'icon'}
															onClick={() => handleEditEvent(event)}
															className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															size={'icon'}
															onClick={() => handleDeleteEvent(event)}
															className="bg-red-600 hover:bg-red-700 flex items-center justify-center"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>

							<PaginationClient
								total={total}
								filter={{ page: filters.page || 1, limit: filters.limit || 10 }}
								setFilter={(newFilter) => setFilters((prev) => ({ ...prev, ...newFilter }))}
								className="mt-6"
							/>
						</>
					)}
				</CardContent>
			</Card>

			{/* Event Modal */}
			<EventModal
				isOpen={isEventModalOpen}
				onClose={() => {
					setIsEventModalOpen(false);
					setSelectedEvent(null);
				}}
				onSubmit={handleSubmitEvent}
				event={selectedEvent}
				isLoading={isSubmitting}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa sự kiện</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa sự kiện "{eventToDelete?.title}"? Hành động này không thể
							hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteEvent} className="bg-red-600 hover:bg-red-700">
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
