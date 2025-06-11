"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import {
  Notification,
  NotificationType,
} from '@/lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { tokens } = useAuth();
  const { 
    markAsRead,
  } = useNotifications();
  useEffect(() => {
    async function fetchNotifications() {
      const response = await fetchApi("/notifications", { method: "GET" }, tokens);
      if (response.status === 200) {
        const data = response.result;
        setNotifications(data);
      }
    }

    fetchNotifications().finally(() => setLoading(false));
    
  }, [tokens]);

  const markNotificationAsRead = async (id: string) => {
    try {
      const response = await fetchApi(`/notifications/${id}/read`, { method: "POST" }, tokens);
      if (response.status === 201) {
        setNotifications(notifications.map((notification) => notification._id === id ? { ...notification, isRead: true } : notification));
        markAsRead();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.NEW_EVENT:
        return "📅";
      case NotificationType.LIBRARY_ACCESS:
        return "📚";
      case NotificationType.ACCOUNT_APPROVED:
        return "👤";
      case NotificationType.JOIN_EVENT:
        return "👥";
      case NotificationType.LEAVE_EVENT:
        return "👥";
      default:
        return "🔔";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No notifications yet</p>
          <p className="text-gray-400 mt-2">
            When you receive notifications, they will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`shadow-sm hover:shadow-md transition-shadow cursor-pointer ${!notification.isRead ? "border-l-4 border-l-blue-500" : ""
                }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader className="py-3 flex flex-row items-start gap-4">
                <div className="text-3xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">
                    {notification.message}
                  </CardTitle>
                  <CardDescription>
                    {new Date(notification.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                {!notification.isRead && (
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 