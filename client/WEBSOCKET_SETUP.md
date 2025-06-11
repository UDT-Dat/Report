# WebSocket Notification Setup Guide

## Overview

Hệ thống notification real-time sử dụng WebSocket để gửi thông báo ngay lập tức khi có sự kiện xảy ra.

## Architecture

### Backend (NestJS)
- **NotificationGateway**: WebSocket gateway xử lý kết nối và gửi notifications
- **NotificationService**: Service tích hợp với gateway để gửi notifications
- **Multiple Device Support**: Một user có thể connect từ nhiều thiết bị

### Frontend (Next.js)
- **useNotifications Hook**: WebSocket client hook 
- **Header Component**: Hiển thị notification bell với badge count
- **Notifications Page**: Trang xem và quản lý notifications

## Features

### ✅ **Persistent Unread Count**
- **Vấn đề cũ**: Khi chuyển trang, unread count từ WebSocket bị mất
- **Giải pháp**: Lưu unread count trong localStorage
- **Sync logic**: Đồng bộ giữa API count và WebSocket count

### ✅ **Smart Count Calculation**
```typescript
// Total unread = API unread + WebSocket realtime unread
const totalUnreadCount = (notifications?.length || 0) + unreadCount;
```

### ✅ **Auto Sync**
- Khi vào trang notifications: Reset WebSocket count
- Khi tab visible lại: Refresh và sync count
- Khi user mark as read: Sync với API

## Usage

### 1. **Installation**

Các dependencies đã được cài đặt:
```json
{
  "socket.io-client": "^4.x.x"
}
```

### 2. **Basic Usage**

```typescript
// In any component
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { 
    isConnected, 
    unreadCount, 
    latestNotification,
    resetUnreadCount 
  } = useNotifications();

  return (
    <div>
      <p>Connection: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Unread: {unreadCount}</p>
      <button onClick={resetUnreadCount}>Clear Count</button>
    </div>
  );
}
```

### 3. **Advanced Usage**

```typescript
// Sync with API count
const { syncWithApiCount } = useNotifications();

// After fetching notifications from API
const notifications = await fetchNotifications();
syncWithApiCount(notifications.filter(n => !n.isRead).length);
```

## How It Works

### 1. **Initial Load**
```
1. User loads page
2. Header fetches unread notifications from API
3. WebSocket connects and loads persisted unread count
4. Total count = API count + WebSocket count
```

### 2. **New Notification Received**
```
1. Backend sends WebSocket notification
2. Frontend receives and shows toast
3. WebSocket unread count +1 (persisted to localStorage)
4. Badge updates immediately
```

### 3. **User Navigates to Notifications Page**
```
1. Page loads all notifications
2. WebSocket unread count reset to 0
3. Badge shows only API unread count
```

### 4. **User Marks Notifications as Read**
```
1. API call to mark as read
2. API unread count decreases
3. Sync function called to update WebSocket count
4. Badge updates accordingly
```

### 5. **User Returns to Site**
```
1. Page visibility change detected
2. Refresh API notifications
3. Sync WebSocket count with new API count
4. Badge shows accurate total
```

## API Integration

### Backend Endpoints
```typescript
// Get unread notifications
GET /notifications?isRead=false

// Mark notification as read
POST /notifications/:id/read

// Mark all as read
POST /notifications/mark-all-read
```

### Sending Notifications (Server-side)
```typescript
// In any service
constructor(
  private notificationService: NotificationService
) {}

async createEvent() {
  // ... create event logic
  
  // Send notification
  await this.notificationService.createJoinEventNotification(
    userId, 
    eventData
  );
  // This automatically sends WebSocket notification
}
```

## Persistence Strategy

### LocalStorage Keys
- `websocket_unread_count`: Số lượng notification chưa đọc từ WebSocket

### Sync Logic
```typescript
const syncWithApiCount = (apiUnreadCount: number) => {
  // If API shows 0 unread, reset WebSocket count
  if (apiUnreadCount === 0) {
    setUnreadCount(0);
    setPersistedUnreadCount(0);
  }
};
```

## Troubleshooting

### Count Not Updating
1. Check localStorage for `websocket_unread_count`
2. Verify API returns correct unread count
3. Check WebSocket connection status

### Count Wrong After Navigation
1. Ensure `syncWithApiCount` is called after API fetch
2. Check if `resetUnreadCount` is called on notifications page
3. Verify localStorage persistence is working

### Multiple Tabs Issues
- LocalStorage is shared between tabs
- All tabs will show same unread count
- Marking read in one tab updates all tabs

## Testing

```bash
# Test WebSocket connection
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/notifications/debug/token

# Test notification creation
POST /notifications (with valid data)

# Test marking as read
POST /notifications/:id/read
```

## Best Practices

1. **Always sync after API calls**
2. **Reset count when viewing notifications**
3. **Handle connection errors gracefully**
4. **Persist count for better UX**
5. **Use visibility API for auto refresh**

## 📦 Cài đặt Dependencies

```bash
cd client
npm install socket.io-client
```

## 🔧 Port Configuration

**Important:** Đảm bảo ports được cấu hình đúng:

- **Frontend (Next.js):** `http://localhost:3000` (default)
- **Backend (NestJS):** `http://localhost:3001` (default)

## 🌐 Environment Variables

Tạo file `.env.local` trong thư mục `client`:

```bash
# Backend API URL (NestJS server) - Client kết nối đến đây
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Nếu frontend chạy trên port khác
# NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 🚨 CORS Fix

Nếu gặp lỗi CORS như:
```
Access to XMLHttpRequest at 'http://localhost:3000/socket.io/...' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Nguyên nhân:** Client đang cố kết nối sai URL

**Solution đã fix:**
1. ✅ **Backend Gateway** đã cấu hình CORS cho multiple origins
2. ✅ **Client Hook** đã sửa URL kết nối đúng backend
3. ✅ **Transports** đã add cả websocket và polling

## 🔧 Files đã được tạo/cập nhật:

### 1. **Hook: `hooks/useNotifications.ts`**
- Kết nối WebSocket với JWT authentication
- **Fixed:** Kết nối đến `BACKEND_URL` thay vì frontend URL
- Quản lý trạng thái connection
- Tự động hiển thị toast khi có thông báo mới
- Quản lý unread count realtime

### 2. **Header Component: `components/header.tsx`**
- Tích hợp WebSocket hook
- Hiển thị connection status
- Badge notification với animate pulse
- Tổng hợp unread count (API + realtime)

### 3. **Backend Gateway** (server-side)
- **Fixed:** CORS config hỗ trợ multiple origins
- Multiple devices support
- JWT authentication

## 🚀 Cách hoạt động:

### 1. **Auto Connection**
```typescript
// Hook tự động kết nối đến backend server
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const socket = io(`${BACKEND_URL}/notifications`);
```

### 2. **CORS Configuration** (Backend)
```typescript
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',    // Next.js default
      'http://localhost:3001',    // Alternative port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  },
  namespace: 'notifications',
})
```

### 3. **Toast Notifications**
```typescript
// Sử dụng useToast từ shadcn/ui
toast({
  title: notification.title,
  description: notification.message,
  duration: 5000,
});
```

### 4. **Connection Status**
```tsx
// Header hiển thị trạng thái kết nối
{isConnected ? (
  <Wifi className="h-4 w-4 text-green-400" />
) : (
  <WifiOff className="h-4 w-4 text-red-400" />
)}
```

## 🔍 Debugging CORS Issues:

### 1. **Check URLs:**
```bash
# Frontend should connect TO backend
Frontend: http://localhost:3000
Backend:  http://localhost:3001
Connection: Frontend → Backend (3001)
```

### 2. **Check Console:**
```bash
# Should see this in browser console:
✅ Connected to notifications: socket_abc123

# If error, check:
- NEXT_PUBLIC_API_URL in .env.local
- Backend server is running on correct port
- CORS origins include your frontend URL
```

### 3. **Network Tab:**
```bash
# Should see successful WebSocket connection to:
ws://localhost:3001/socket.io/?EIO=4&transport=websocket

# NOT to frontend URL like:
ws://localhost:3000/socket.io/  ❌ (Wrong!)
```

## 🎯 Troubleshooting:

### ❌ **Common Mistakes:**

1. **Wrong URL:** Client connecting to itself instead of backend
2. **Port Confusion:** Frontend and backend on same port
3. **CORS Missing:** Backend not allowing frontend origin
4. **Environment Variable:** `NEXT_PUBLIC_API_URL` not set

### ✅ **Correct Setup:**

1. **Backend runs on:** `http://localhost:3001`
2. **Frontend runs on:** `http://localhost:3000`  
3. **Client connects to:** `http://localhost:3001/notifications`
4. **CORS allows:** `http://localhost:3000`

## 🚀 Final Test:

```bash
# 1. Start backend
cd server && npm run start:dev

# 2. Start frontend  
cd client && npm run dev

# 3. Check browser console
# Should see: ✅ Connected to notifications: socket_xxx

# 4. Test notification
# Backend: await notificationService.createJoinEventNotification(...)
# Frontend: Should show toast + increment badge
```

## 🎉 Setup Complete!

Hệ thống WebSocket với CORS fix đã sẵn sàng! 🚀 