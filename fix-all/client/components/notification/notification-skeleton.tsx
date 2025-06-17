'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationSkeleton() {
	return (
		<Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-sm">
			<CardContent className="p-4 flex items-start gap-4">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-3 w-24" />
				</div>
			</CardContent>
		</Card>
	);
}
