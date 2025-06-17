import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseImageUrl } from '@/lib/parseImageUrl';
import { Event } from '@/lib/types';
import { formatDate, getBadgeStatus } from '@/lib/utils';

interface EventBoxProps {
	events: Event[];
}

export default function EventBox({ events }: EventBoxProps) {
	return (
		<Card className="border shadow-sm">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-xl font-bold">Sự kiện sắp diễn ra</CardTitle>
					<Link href="/events" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
						Xem tất cả
					</Link>
				</div>
				<CardDescription>Các sự kiện của Văn Lang Tech Club</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{events.map((event) => (
					<Link href={`/events/${event._id}`} key={event._id}>
						<div className="flex space-x-4 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
							<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
								<Image
									src={parseImageUrl(event.imageUrl)}
									alt={event.title}
									fill
									className="object-cover"
								/>
								<Badge
									className={cn(
										'absolute bottom-1 right-1 text-xs',
										getBadgeStatus(event.startDate, event.endDate) === 'upcoming'
											? 'bg-green-500 hover:bg-green-600'
											: '',
										getBadgeStatus(event.startDate, event.endDate) === 'ongoing'
											? 'bg-blue-500 hover:bg-blue-600'
											: '',
										getBadgeStatus(event.startDate, event.endDate) === 'past'
											? 'bg-gray-500 hover:bg-gray-600'
											: ''
									)}
								>
									{getBadgeStatus(event.startDate, event.endDate) === 'upcoming'
										? 'Sắp diễn ra'
										: getBadgeStatus(event.startDate, event.endDate) === 'ongoing'
										? 'Đang diễn ra'
										: 'Đã kết thúc'}
								</Badge>
							</div>
							<div className="flex-1">
								<h3 className="font-medium line-clamp-2">{event.title}</h3>
								<div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
									<div className="flex items-center">
										<Calendar className="mr-1 h-3.5 w-3.5" />
										<span>{formatDate(event.startDate)}</span>
									</div>
									<div className="flex items-center">
										<Calendar className="mr-1 h-3.5 w-3.5" />
										<span>{formatDate(event.endDate)}</span>
									</div>
									<div className="flex items-center">
										<MapPin className="mr-1 h-3.5 w-3.5" />
										<span className="line-clamp-1">{event.location}</span>
									</div>
								</div>
							</div>
						</div>
					</Link>
				))}
				<div className="pt-2">
					<Link href="/events/register">
						<Button variant="outline" className="w-full">
							Đăng ký tham gia sự kiện
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

// Helper function for conditional class names
function cn(...classes: string[]) {
	return classes.filter(Boolean).join(' ');
}
