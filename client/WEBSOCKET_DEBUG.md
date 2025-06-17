# WebSocket Debug Guide

Hướng dẫn debug khi gặp vấn đề "connect rồi ngay lập tức disconnect".

## 🚨 Common Issue: "io server disconnect"

### Symptoms:
```bash
✅ Connected to notifications: 2jqFn2BToLT9Zgv7AAAH
❌ Disconnected from notifications: io server disconnect
```

### Root Causes:

1. **JWT Token Issues** ⚠️ Most Common
2. **CORS Configuration**
3. **Network/Proxy Issues**
4. **Server Configuration**

## 🔍 Step-by-Step Debug

### 1. **Check JWT Token Validity**

#### A. Frontend Debug:
```javascript
// In browser console, check current token:
console.log('Current token:', localStorage.getItem('accessToken'));
```

#### B. Backend Debug Endpoint:
```bash
# Test JWT validation with current token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/notifications/debug/token
```

Expected response:
```json
{
  "tokenValid": true,
  "userId": "user_id_here",
  "payload": { ... },
  "tokenPreview": "eyJhbGciOiJIUzI1NiI..."
}
```

### 2. **Check Server Logs**

Look for these patterns in NestJS logs:

#### ✅ **Successful Connection:**
```bash
[NotificationGateway] New connection attempt: 2jqFn2BToLT9Zgv7AAAH
[NotificationGateway] Token received for client 2jqFn2BToLT9Zgv7AAAH: eyJhbGciOiJIUzI1NiI...
[NotificationGateway] JWT payload for client 2jqFn2BToLT9Zgv7AAAH: { "sub": "user123", ... }
[NotificationGateway] ✅ Client successfully connected: 2jqFn2BToLT9Zgv7AAAH, User: user123
```

#### ❌ **Failed Connection:**
```bash
[NotificationGateway] New connection attempt: 2jqFn2BToLT9Zgv7AAAH
[NotificationGateway] ❌ Authentication failed for client 2jqFn2BToLT9Zgv7AAAH: JsonWebTokenError: invalid signature
```

### 3. **Common JWT Issues & Fixes**

#### A. **Invalid Signature**
```bash
Error: JsonWebTokenError: invalid signature
```

**Fix:** JWT secret mismatch between auth module and notification module
- ✅ Both modules now use ConfigService
- Check `.env` file has correct `JWT_SECRET`

#### B. **Token Expired**
```bash
Error: TokenExpiredError: jwt expired
```

**Fix:** Refresh token or re-login
```javascript
// Force re-login
localStorage.removeItem('accessToken');
window.location.href = '/auth/login';
```

#### C. **Malformed Token**
```bash
Error: JsonWebTokenError: invalid token
```

**Fix:** Check token format
```javascript
// Token should start with 'eyJ'
const token = localStorage.getItem('accessToken');
console.log('Token format valid:', token?.startsWith('eyJ'));
```

#### D. **Missing userId in Payload**
```bash
Warning: No userId found in token payload
```

**Fix:** Check JWT payload structure. Should have `sub` or `userId`:
```json
{
  "sub": "user_id_here",
  "userId": "user_id_here",  // or this
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 4. **Enhanced Frontend Debug**

Add to `useNotifications.ts` for more debugging:

```typescript
// Add this to see auth error details
newSocket.on('auth_error', (error) => {
  console.error('🔐 Server Authentication Error:', error);
  
  // Force re-login on auth error
  if (error.type === 'JsonWebTokenError' || error.type === 'TokenExpiredError') {
    console.log('🔄 Token invalid, redirecting to login...');
    localStorage.removeItem('accessToken');
    window.location.href = '/auth/login';
  }
});
```

### 5. **Network Issues Debug**

#### Check WebSocket Transport:
```javascript
// In browser DevTools > Network tab, look for:
ws://localhost:3001/socket.io/?EIO=4&transport=websocket

// Should NOT see errors like:
// - 401 Unauthorized
// - 403 Forbidden  
// - CORS errors
```

#### Force Polling (if websocket blocked):
```typescript
const socket = io(`${BACKEND_URL}/notifications`, {
  transports: ['polling'], // Force polling only
  auth: { token: tokens.accessToken }
});
```

## 🎯 Quick Fixes Checklist

### ✅ **JWT Configuration** (Most Important)
```bash
# 1. Check both modules use same JWT secret
server/src/auth/auth.module.ts ✅
server/src/notification/notification.module.ts ✅

# 2. Check .env file
JWT_SECRET=your-secret-key-here
```

### ✅ **Token Refresh**
```javascript
// If token expired, get new one:
await fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${refreshToken}` }
});
```

### ✅ **Clear Storage & Re-login**
```javascript
// Nuclear option:
localStorage.clear();
sessionStorage.clear();
window.location.href = '/auth/login';
```

## 🚀 Test Script

```bash
#!/bin/bash
echo "🧪 Testing WebSocket Connection..."

# 1. Test API endpoint
echo "1. Testing API access..."
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/notifications/debug/token

# 2. Test WebSocket with wscat (install: npm i -g wscat)
echo "2. Testing WebSocket connection..."
wscat -c "ws://localhost:3001/socket.io/?EIO=4&transport=websocket" \
      -H "Authorization: Bearer $TOKEN"
```

## 🔧 Final Solution

If all else fails, try this step-by-step:

1. **Restart backend server** - JWT config changes need restart
2. **Clear browser storage** - Remove old/invalid tokens
3. **Re-login to get fresh token** - Ensure valid JWT
4. **Check server logs** - Look for detailed error messages
5. **Use debug endpoint** - Verify token works with HTTP first

Most connection issues are resolved by ensuring JWT secrets match and tokens are valid! 🎯 