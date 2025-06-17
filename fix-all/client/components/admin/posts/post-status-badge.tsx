'use client';

import { Badge } from '@/components/ui/badge';
import type { PostStatus } from '@/lib/types';

interface PostStatusBadgeProps {
	readonly status: PostStatus;
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
	const statusConfig = {
		pending: { label: 'Chờ duyệt', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
		approved: { label: 'Đã duyệt', className: 'bg-green-50 text-green-700 border-green-200' },
		rejected: { label: 'Từ chối', className: 'bg-red-50 text-red-700 border-red-200' },
	};

	const config = statusConfig[status];

	return (
		<Badge variant="outline" className={config?.className}>
			{config?.label}
		</Badge>
	);
}
