"use client"

import { Card, CardContent } from "@/components/ui/card"
import { type Notification, NotificationType } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Bell, Calendar, Check, FileText, Users, X } from "lucide-react"

interface NotificationItemProps {
 readonly notification: Notification
 readonly onClick: (notification: Notification) => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.NEW_EVENT:
        return <Calendar className="h-5 w-5 text-purple-500" />
      case NotificationType.LIBRARY_ACCESS:
        return <FileText className="h-5 w-5 text-blue-500" />
      case NotificationType.ACCOUNT_APPROVED:
        return <Check className="h-5 w-5 text-green-500" />
      case NotificationType.JOIN_EVENT:
        return <Users className="h-5 w-5 text-indigo-500" />
      case NotificationType.LEAVE_EVENT:
        return <Users className="h-5 w-5 text-orange-500" />
      case NotificationType.POST_APPROVED:
        return <Check className="h-5 w-5 text-green-500" />
      case NotificationType.POST_REJECTED:
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case NotificationType.NEW_EVENT:
        return "bg-purple-100 dark:bg-purple-900/20"
      case NotificationType.LIBRARY_ACCESS:
        return "bg-blue-100 dark:bg-blue-900/20"
      case NotificationType.ACCOUNT_APPROVED:
        return "bg-green-100 dark:bg-green-900/20"
      case NotificationType.JOIN_EVENT:
        return "bg-indigo-100 dark:bg-indigo-900/20"
      case NotificationType.LEAVE_EVENT:
        return "bg-orange-100 dark:bg-orange-900/20"
      case NotificationType.POST_APPROVED:
        return "bg-green-100 dark:bg-green-900/20"
      case NotificationType.POST_REJECTED:
        return "bg-red-100 dark:bg-red-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-800/40"
    }
  }

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case NotificationType.NEW_EVENT:
        return "border-purple-300 dark:border-purple-700"
      case NotificationType.LIBRARY_ACCESS:
        return "border-blue-300 dark:border-blue-700"
      case NotificationType.ACCOUNT_APPROVED:
        return "border-green-300 dark:border-green-700"
      case NotificationType.JOIN_EVENT:
        return "border-indigo-300 dark:border-indigo-700"
      case NotificationType.LEAVE_EVENT:
        return "border-orange-300 dark:border-orange-700"
      case NotificationType.POST_APPROVED:
        return "border-green-300 dark:border-green-700"
      case NotificationType.POST_REJECTED:
        return "border-red-300 dark:border-red-700"
      default:
        return "border-gray-300 dark:border-gray-700"
    }
  }

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  }

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-md ${
        !notification.isRead
          ? "border-l-4 border-blue-500 dark:border-blue-400 bg-white/90 dark:bg-gray-800/90"
          : "bg-white/70 dark:bg-gray-800/70"
      }`}
      onClick={() => onClick(notification)}
    >
      <CardContent className="p-4 flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
            notification.type,
          )} ${!notification.isRead ? getNotificationBorder(notification.type) : ""}`}
        >
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 dark:text-gray-100 font-medium">{notification.message}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
        </div>
        {!notification.isRead && <div className="h-3 w-3 bg-blue-500 rounded-full mt-2"></div>}
      </CardContent>
    </Card>
  )
}
