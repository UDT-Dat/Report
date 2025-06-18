'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@/lib/types';
import { Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface EventsSidebarProps {
	readonly events: Event[];
	readonly loading: boolean;
}

function EventsSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => {
				const uniqueKey = `skeleton-${i}-${Math.random().toString(36)}`;
				return (
					<div key={uniqueKey} className="animate-pulse">
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
						<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1" />
						<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
					</div>
				);
			})}
		</div>
	);
}

export function EventsSidebar({ events, loading }: EventsSidebarProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Calendar className="w-5 h-5 text-purple-500" />
					<CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
						Sự kiện sắp tới
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				{(() => {
					let content;
					if (loading) {
						content = <EventsSkeleton />;
					} else if (events.length === 0) {
						content = (
							<div className="text-center py-8">
								<Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
								<p className="text-gray-500 dark:text-gray-400">Chưa có sự kiện nào</p>
							</div>
						);
					} else {
						content = (
							<div className="space-y-4">
								{events.slice(0, 3).map((event) => (
									<Link
										key={event._id}
										href={`/events/${event._id}`}
										className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
									>
										<h4 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
											{event.title}
										</h4>
										<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
											<Calendar className="w-4 h-4 mr-1" />
											{formatDate(event.startDate)}
										</div>
										<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
											<MapPin className="w-4 h-4 mr-1" />
											<span className="line-clamp-1">{event.location}</span>
										</div>
									</Link>
								))}
							</div>
						);
					}
					return content;
				})()}

				<div className="mt-4 text-center">
					<Link href="/events">
						<Button
							variant="outline"
							className="w-full bg-white/50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200"
						>
							Xem tất cả sự kiện
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
