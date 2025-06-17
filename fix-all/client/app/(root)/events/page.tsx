import { Calendar, Clock, MapPin, User, Users } from 'lucide-react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import PaginationServer from '@/components/pagination/PaginationServer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { Event } from '@/lib/types';
import { cn, formatDate, getBadgeStatus, getQueryFromStatus } from '@/lib/utils';

type SearchParams = {
	page: number;
	limit: number;
	title: string;
	description: string;
	status: 'upcoming' | 'ongoing' | 'past' | '';
	maxParticipants: number;
};

// Updated getEvents function to handle searchParams properly
const getEvents = async (
	searchParams: SearchParams,
	accessToken: string | undefined,
	refreshToken: string | undefined
) => {
	const queryParams = new URLSearchParams();

	// Create an array of entries manually since we know the structure
	const searchParamsEntries: [string, any][] = [
		['page', searchParams.page],
		['limit', searchParams.limit],
		['title', searchParams.title],
		['description', searchParams.description],
		['status', searchParams.status],
		['maxParticipants', searchParams.maxParticipants],
	];

	searchParamsEntries.forEach(([key, value]) => {
		// ignore status
		if (key === 'status') return;
		if (
			value !== undefined &&
			value !== null &&
			value !== '' &&
			typeof value !== 'object' &&
			!Array.isArray(value)
		) {
			queryParams.append(key, value.toString());
		}
	});

	const statusQuery = getQueryFromStatus(searchParams.status);
	Object.entries(statusQuery).forEach(([key, value]) => {
		queryParams.append(key, value.toString());
	});

	const queryString = queryParams.toString();
	const response = await fetchApi(
		`/events?${queryString}`,
		{
			method: 'GET',
		},
		{
			accessToken: accessToken,
			refreshToken: refreshToken,
		}
	);
	return {
		events: response.result.events,
		pagination: response.result.pagination,
	};
};

const Statuses = [
	{
		label: 'Tất cả',
		value: undefined,
		icon: Clock,
	},
	{
		label: 'Sắp diễn ra',
		value: 'upcoming',
		icon: Calendar,
	},
	{
		label: 'Đang diễn ra',
		value: 'ongoing',
		icon: Users,
	},
	{
		label: 'Đã kết thúc',
		value: 'past',
		icon: Clock,
	},
];

// Updated component to await searchParams
export default async function EventsPage(props: { readonly searchParams: Promise<SearchParams> }) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('access_token')?.value;
	const refreshToken = cookieStore.get('refresh_token')?.value;

	// Await searchParams before using it
	const searchParams = await props.searchParams;

	const {
		events,
		pagination,
	}: { events: Event[]; pagination: { total: number; page: number; limit: number } } =
		await getEvents(searchParams, accessToken, refreshToken);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header Section */}
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
						Sự kiện CLB IT VLU
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						Khám phá và tham gia các sự kiện công nghệ thú vị, kết nối với cộng đồng IT và phát
						triển kỹ năng của bạn
					</p>
				</div>

				{/* Filter Section */}
				<div className="mb-8">
					<div className="flex flex-wrap justify-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
						{Statuses.map((status) => {
							const IconComponent = status.icon;
							const isActive = searchParams.status === status.value;
							return (
								<Link
									href={`/events?${status.value ? 'status=' + status.value : ''}`}
									key={status.value ?? 'all'}
								>
									<Button
										variant={isActive ? 'default' : 'outline'}
										className={cn(
											'flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105',
											isActive
												? 'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white shadow-lg hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700'
												: 'bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'
										)}
									>
										<IconComponent className="w-4 h-4" />
										{status.label}
									</Button>
								</Link>
							);
						})}
					</div>
				</div>

				{/* Events Grid */}
				<div className="mb-8">
					{events?.length > 0 ? (
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{events.map((event) => (
								<Card
									className="group h-full overflow-hidden hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg dark:shadow-gray-900/20"
									key={event._id}
								>
									<div className="relative h-56 overflow-hidden">
										<Image
											src={parseImageUrl(event.imageUrl)}
											alt={event.title}
											fill
											className="object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
										{(() => {
											const badgeStatus = getBadgeStatus(event.startDate, event.endDate);
											let badgeClass = '';
											if (badgeStatus === 'upcoming') {
												badgeClass = 'bg-emerald-500 hover:bg-emerald-600 text-white';
											} else if (badgeStatus === 'ongoing') {
												badgeClass = 'bg-blue-500 hover:bg-blue-600 text-white';
											} else {
												badgeClass = 'bg-gray-500 hover:bg-gray-600 text-white';
											}
											let badgeLabel = '';
											if (badgeStatus === 'upcoming') {
												badgeLabel = 'Sắp diễn ra';
											} else if (badgeStatus === 'ongoing') {
												badgeLabel = 'Đang diễn ra';
											} else {
												badgeLabel = 'Đã kết thúc';
											}
											return (
												<Badge
													className={cn(
														'absolute top-4 right-4 px-3 py-1 text-xs font-semibold shadow-lg',
														badgeClass
													)}
												>
													{badgeLabel}
												</Badge>
											);
										})()}
									</div>

									<CardHeader className="pb-3">
										<h3 className="text-xl font-bold line-clamp-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
											{event.title}
										</h3>
									</CardHeader>

									<CardContent className="pt-0 space-y-4">
										{/* Event Details */}
										<div className="space-y-3">
											<div className="flex items-center text-gray-600 dark:text-gray-300">
												<Calendar className="mr-3 h-4 w-4 text-blue-500 dark:text-blue-400" />
												<span className="text-sm font-medium">
													{formatDate(event.startDate)} - {formatDate(event.endDate)}
												</span>
											</div>
											<div className="flex items-center text-gray-600 dark:text-gray-300">
												<MapPin className="mr-3 h-4 w-4 text-red-500 dark:text-red-400" />
												<span className="text-sm line-clamp-1">{event.location}</span>
											</div>
										</div>

										{/* Organizer */}
										<Link
											href={`/profile/${event?.createdBy?._id}`}
											className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group/organizer"
										>
											<Avatar className="border-2 border-blue-200 dark:border-blue-600 group-hover/organizer:border-blue-400 dark:group-hover/organizer:border-blue-500 transition-colors">
												<AvatarImage
													className="object-cover"
													src={parseImageUrl(event?.createdBy?.avatar)}
												/>
												<AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold">
													{event?.createdBy?.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
													{event?.createdBy?.name}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Người tổ chức</p>
											</div>
										</Link>

										{/* Footer */}
										<div className="flex items-center justify-between pt-2">
											<div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
												<div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
													<User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
													<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
														{event.participants.length}
													</span>
												</div>
												<span className="text-xs text-gray-500 dark:text-gray-400">tham gia</span>
											</div>

											<Link href={`/events/${event._id}`}>
												<Button className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
													Xem chi tiết
												</Button>
											</Link>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center py-16">
							<div className="max-w-md mx-auto">
								<div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
									<Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
								</div>
								<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
									Không có sự kiện nào
								</h3>
								<p className="text-gray-500 dark:text-gray-400 mb-6">
									Hiện tại chưa có sự kiện nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc
									hoặc quay lại sau.
								</p>
								<Link href="/events">
									<Button className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 text-white px-6 py-3 rounded-xl">
										Xem tất cả sự kiện
									</Button>
								</Link>
							</div>
						</div>
					)}
				</div>

				{/* Pagination */}
				<div className="flex justify-center">
					<PaginationServer pagination={pagination} />
				</div>
			</div>
		</div>
	);
}
