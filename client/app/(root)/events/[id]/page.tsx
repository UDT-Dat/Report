'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog'; // Import Dialog components
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { Event } from '@/lib/types';
import { cn, formatDate, getBadgeStatus, updateHtml } from '@/lib/utils';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { use, useEffect, useState } from 'react';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { toast } = useToast();
	const [isRegistering, setIsRegistering] = useState(false);
	const [isParticipant, setIsParticipant] = useState(false);
	const [event, setEvent] = useState<Event | null>(null);
	const { tokens, user } = useAuth();
	const [loading, setLoading] = useState(true);
	const { id } = use(params);
	const router = useRouter();

	// State for controlling the image zoom dialog
	const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

	// Tìm sự kiện theo ID
	const getEvent = async (id: string) => {
		const response = await fetchApi(
			`/events/${id}`,
			{
				method: 'GET',
			},
			{
				accessToken: tokens?.accessToken,
				refreshToken: tokens?.refreshToken,
			}
		);
		if (response.status === 200) {
			setEvent(response.result as Event);
		} else {
			setEvent(null);
		}
	};
	const getIsParticipant = async (id: string) => {
		const response = await fetchApi(
			`/events/${id}/is-participant`,
			{
				method: 'GET',
			},
			{
				accessToken: tokens?.accessToken,
				refreshToken: tokens?.refreshToken,
			}
		);
		if (typeof response.result === 'boolean') {
			setIsParticipant(response.result);
		} else {
			setIsParticipant(false);
		}
	};
	// Xử lý đăng ký tham gia
	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsRegistering(true);
		if (tokens?.accessToken) {
			const response = await fetchApi(
				`/events/${id}/join`,
				{
					method: 'POST',
				},
				{
					accessToken: tokens?.accessToken,
					refreshToken: tokens?.refreshToken,
				}
			);
			if ('error' in response.result) {
				toast({
					title: 'Đăng ký thất bại!',
					description: response.result.message,
					variant: 'destructive',
				});
				setIsRegistering(false);
				setIsParticipant(false);
			} else {
				toast({
					title: 'Đăng ký thành công!',
					description:
						'Bạn đã đăng ký tham gia sự kiện thành công. Chúng tôi sẽ liên hệ lại với bạn qua email.',
					variant: 'success',
				});
				setIsRegistering(false);
				setIsParticipant(true);
				setEvent({
					...event,
					participants: [...(event?.participants || []), user?._id] as string[],
				} as Event);
			}
		} else {
			router.push('/auth/login');
		}
	};
	const handleUnregister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsRegistering(true);
		if (tokens?.accessToken) {
			const response = await fetchApi(
				`/events/${id}/leave`,
				{
					method: 'POST',
				},
				{
					accessToken: tokens?.accessToken,
					refreshToken: tokens?.refreshToken,
				}
			);
			if ('error' in response.result) {
				toast({
					title: 'Hủy đăng ký thất bại!',
					description: response.result.message,
					variant: 'destructive',
				});
				setIsRegistering(false);
				setIsParticipant(true);
			} else {
				toast({
					title: 'Hủy đăng ký thành công!',
					variant: 'success',
				});
				setIsRegistering(false);
				setIsParticipant(false);
				setEvent({
					...event,
					participants:
						event?.participants?.filter((participant) => participant !== user?._id) || [],
				} as Event);
			}
		}
	};
	useEffect(() => {
		Promise.all([getEvent(id), getIsParticipant(id)]).then(() => {
			setLoading(false);
		});
	}, [id]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-6">
				<div className="mb-6">
					<div className="inline-flex items-center">
						<div className="mr-2 h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
						<div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
					</div>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					<div className="md:col-span-2">
						{/* Event Image Skeleton */}
						<div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse">
							<div className="absolute top-4 right-4">
								<div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse"></div>
							</div>
						</div>

						{/* Title Skeleton */}
						<div className="mb-4">
							<div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
						</div>

						{/* Category and Attendees Skeleton */}
						<div className="mb-6 flex flex-wrap gap-4">
							<div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
							</div>
						</div>

						{/* Event Details Cards Skeleton */}
						<div className="mb-8 grid gap-4 md:grid-cols-">
							{[1, 2, 3].map((i) => (
								<div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
									<div className="flex items-center p-4">
										<div className="mr-3 h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
										<div className="flex-1">
											<div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
											<div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Event Description Skeleton */}
						<div className="mb-8">
							<div className="mb-4 h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
							<div className="space-y-2">
								<div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
							</div>
						</div>

						{/* Speakers Skeleton */}
						<div className="mb-8">
							<div className="mb-4 h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
							<div className="grid gap-4 sm:grid-cols-2">
								{[1, 2].map((i) => (
									<div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
										<div className="flex items-center p-4">
											<div className="mr-4 h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
											<div className="flex-1">
												<div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
												<div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
												<div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Registration Card Skeleton */}
					<div>
						<div className="sticky top-6 rounded-lg border bg-card text-card-foreground shadow-sm">
							<div className="p-6">
								{/* Registration Header */}
								<div className="mb-6">
									<div className="mb-2 h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
									<div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
								</div>

								{/* Progress Bar */}
								<div className="mb-6">
									<div className="mb-2 flex items-center justify-between">
										<div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
										<div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
									</div>
									<div className="h-2 w-full bg-gray-200 rounded-full animate-pulse"></div>
								</div>

								{/* Form Skeleton */}
								<div className="space-y-4">
									{[1, 2, 3, 4].map((i) => (
										<div key={i}>
											<div className="mb-1 h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
											<div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
										</div>
									))}
									<div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
								</div>

								{/* Action Buttons */}
								<div className="mt-4 flex space-x-2">
									<div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
									<div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
								</div>

								{/* Organizer Info */}
								<div className="mt-6">
									<div className="mb-2 h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
									<div className="flex items-center">
										<div className="mr-3 h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
										<div className="flex-1">
											<div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
											<div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="container mx-auto px-4 py-12 text-center">
				<h1 className="text-2xl font-bold">Sự kiện không tồn tại</h1>
				<p className="mt-4 text-gray-500">
					Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
				</p>
				<Link href="/events">
					<Button className="mt-6">Quay lại trang sự kiện</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<Link
					href="/events"
					className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại danh sách sự kiện
				</Link>
			</div>

			<div className="grid gap-8 md:grid-cols-3">
				<div className="md:col-span-2">
					<div
						className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg cursor-pointer"
						onClick={() => setIsImageZoomOpen(true)}
					>
						<Image
							src={parseImageUrl(event.imageUrl)}
							alt={event.title || 'Sự kiện'}
							fill
							className="object-cover"
						/>
						<div className="absolute top-4 right-4">
							<Badge
								className={cn(
									getBadgeStatus(event.startDate, event.endDate) === 'upcoming'
										? 'bg-green-500 hover:bg-green-600'
										: getBadgeStatus(event.startDate, event.endDate) === 'ongoing'
										? 'bg-blue-500 hover:bg-blue-600'
										: getBadgeStatus(event.startDate, event.endDate) === 'past'
										? 'bg-gray-500 hover:bg-gray-600'
										: ''
								)}
							>
								{getBadgeStatus(event.startDate, event.endDate) === 'upcoming'
									? 'Sắp diễn ra'
									: getBadgeStatus(event.startDate, event.endDate) === 'ongoing'
									? 'Đang diễn ra'
									: getBadgeStatus(event.startDate, event.endDate) === 'past'
									? 'Đã kết thúc'
									: ''}
							</Badge>
						</div>
					</div>

					<h1 className="mb-4 text-3xl font-bold">{event.title}</h1>

					<div className="mb-6 flex flex-wrap gap-4">
						<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
							<Users className="mr-1 h-4 w-4" />
							<span>
								{event.participants?.length ?? 0}/{event.maxParticipants} người tham dự
							</span>
						</div>
					</div>

					<div className="mb-8 grid gap-4 md:grid-cols-3">
						<Card>
							<CardContent className="flex items-center p-4">
								<Calendar className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
								<div>
									<p className="text-xs text-gray-500 dark:text-gray-400">Ngày bắt đầu</p>
									<p className="font-medium">{formatDate(event.startDate)}</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center p-4">
								<Calendar className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
								<div>
									<p className="text-xs text-gray-500 dark:text-gray-400">Ngày kết thúc</p>
									<p className="font-medium">{formatDate(event.endDate)}</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="flex items-center p-4">
								<MapPin className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
								<div>
									<p className="text-xs text-gray-500 dark:text-gray-400">Địa điểm</p>
									<p className="font-medium">{event.location}</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="mb-8">
						<h2 className="mb-4 text-xl font-bold">Thông tin sự kiện</h2>
						<div
							className="prose max-w-none dark:prose-invert"
							dangerouslySetInnerHTML={{ __html: updateHtml(event.description) }}
						/>
					</div>
				</div>

				<div>
					<Card className="sticky top-6">
						<CardContent className="p-6">
							<div className="mb-6">
								<h3 className="mb-2 text-lg font-bold">Đăng ký tham gia</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Còn {event.maxParticipants - (event.participants?.length ?? 0)} chỗ trống. Hãy
									đăng ký ngay!
								</p>
							</div>

							<div className="mb-6">
								<div className="mb-2 flex items-center justify-between text-sm">
									<span>Số lượng đăng ký</span>
									<span>
										{event.participants?.length ?? 0}/{event.maxParticipants}
									</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										className="h-full rounded-full bg-blue-600"
										style={{
											width: `${(event.participants?.length / event.maxParticipants) * 100}%`,
										}}
									></div>
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex flex-col gap-4 items-start">
							<div className="mt-6">
								<h3 className="mb-2 text-sm font-medium">Đơn vị tổ chức</h3>
								<div className="flex items-center">
									<div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
										<Image
											src={parseImageUrl(event.createdBy?.avatar || '')}
											alt={event.createdBy?.name || ''}
											width={40}
											height={40}
											className="object-cover"
										/>
									</div>
									<div>
										<p className="font-medium">{event.createdBy?.name}</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{event.createdBy?.email}
										</p>
									</div>
								</div>
							</div>
							{new Date() < new Date(event.endDate) && (
								<>
									{isParticipant ? (
										<Button
											variant="outline"
											className="w-full"
											disabled={isRegistering}
											onClick={handleUnregister}
										>
											{isRegistering ? 'Đang hủy...' : 'Hủy đăng ký'}
										</Button>
									) : (
										(typeof event.maxParticipants === 'undefined' ||
											event.participants.length < event.maxParticipants) && (
											<Button
												type="submit"
												className="w-full"
												disabled={isRegistering}
												onClick={handleRegister}
											>
												{isRegistering ? 'Đang đăng ký...' : 'Đăng ký tham gia'}
											</Button>
										)
									)}
								</>
							)}
							{new Date() >= new Date(event.endDate) && (
								<div className="w-full text-center py-4">
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Sự kiện đã kết thúc. Không thể đăng ký tham gia.
									</p>
								</div>
							)}
						</CardFooter>
					</Card>
				</div>
			</div>

			{/* Image Zoom Dialog */}
			{event.imageUrl && (
				<Dialog open={isImageZoomOpen} onOpenChange={setIsImageZoomOpen}>
					<DialogContent className="max-w-fit p-0 bg-transparent border-none shadow-none">
						<img
							src={parseImageUrl(event.imageUrl)}
							alt="Zoomed"
							className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl cursor-zoom-out"
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
