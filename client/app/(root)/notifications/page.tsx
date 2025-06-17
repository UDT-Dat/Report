'use client';

import { EmptyNotifications } from '@/components/notification/empty-notifications';
import { NotificationItem } from '@/components/notification/notification-item';
import { NotificationSkeleton } from '@/components/notification/notification-skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import type { Notification } from '@/lib/types';
import { BellRing } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const { tokens } = useAuth();
	const { markAsRead } = useNotifications();

	useEffect(() => {
		async function fetchNotifications() {
			const response = await fetchApi('/notifications', { method: 'GET' }, tokens);
			if (response.status === 200) {
				const data = response.result;
				setNotifications(data);
			}
		}

		fetchNotifications().finally(() => setLoading(false));
	}, [tokens]);

	const markNotificationAsRead = async (id: string) => {
		try {
			const response = await fetchApi(`/notifications/${id}/read`, { method: 'POST' }, tokens);
			if (response.status === 201) {
				setNotifications(
					notifications.map((notification) =>
						notification._id === id ? { ...notification, isRead: true } : notification
					)
				);
				markAsRead();
			}
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.isRead) {
			markNotificationAsRead(notification._id);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
			</div>

			<div className="container mx-auto px-4 py-8 relative max-w-3xl">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
						<BellRing className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
						Thông báo
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Cập nhật về bài viết, sự kiện và hoạt động của bạn
					</p>
				</div>

				{/* Notifications List */}
				<div className="space-y-4">
					{loading ? (
						// Loading state
						Array.from({ length: 5 }).map((_, index) => <NotificationSkeleton key={index} />)
					) : notifications.length === 0 ? (
						// Empty state
						<EmptyNotifications />
					) : (
						// Notifications list
						notifications.map((notification) => (
							<NotificationItem
								key={notification._id}
								notification={notification}
								onClick={handleNotificationClick}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}
