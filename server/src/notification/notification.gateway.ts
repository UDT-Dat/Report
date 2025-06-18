import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000', // Next.js default port
      'http://localhost:3001', // Alternative port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationGateway');
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      this.logger.log(`New connection attempt: ${client.id}`);

      if (!token) {
        this.logger.warn(`No token provided for client ${client.id}`);
        client.disconnect();
        return;
      }

      this.logger.log(
        `Token received for client ${client.id}: ${token.substring(0, 20)}...`,
      );

      const payload = this.jwtService.verify(token);
      this.logger.log(
        `JWT payload for client ${client.id}:`,
        JSON.stringify(payload, null, 2),
      );

      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(
          `No userId found in token payload for client ${client.id}.`,
        );
        client.disconnect();
        return;
      }

      // Store user-socket mapping - hỗ trợ multiple devices
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set<string>());
      }
      this.userSockets.get(userId)!.add(client.id);

      client.data.userId = userId;

      // Join user to their personal room
      client.join(`user_${userId}`);

      const deviceCount = this.userSockets.get(userId)!.size;
      this.logger.log(
        `✅ Client successfully connected: ${client.id}, User: ${userId}, Total devices: ${deviceCount}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Authentication failed for client ${client.id}:`,
        error.message,
      );
      this.logger.error(`Error stack:`, error.stack);

      // Send error info to client before disconnecting
      client.emit('auth_error', {
        message: error.message,
        type: error.name,
      });

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      const userSocketSet = this.userSockets.get(userId)!;
      userSocketSet.delete(client.id);

      // Nếu user không còn device nào connected, xóa entry
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }

      const remainingDevices = userSocketSet.size;
      this.logger.log(
        `Client disconnected: ${client.id}, User: ${userId}, Remaining devices: ${remainingDevices}`,
      );
    }
  }

  // Helper method for sending simple notifications to all user devices
  async sendNotificationToUser(
    userId: string,
    notification: { title: string; message: string },
  ) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet && userSocketSet.size > 0) {
      // Gửi đến tất cả devices của user
      this.server.to(`user_${userId}`).emit('newNotification', {
        title: notification.title,
        message: notification.message,
        timestamp: new Date(),
      });

      this.logger.log(
        `Notification sent to user ${userId} on ${userSocketSet.size} device(s): ${notification.title}`,
      );
    } else {
      this.logger.log(
        `User ${userId} is not online - notification not sent: ${notification.title}`,
      );
    }
  }

  async sendNotificationToUsers(
    userIds: string[],
    notification: { title: string; message: string },
  ) {
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
    }
  }

  // Utility method để check user online status
  isUserOnline(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }

  // Utility method để lấy số lượng devices của user
  getUserDeviceCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  // Utility method để lấy tổng số users online
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Utility method để lấy tổng số connections
  getTotalConnections(): number {
    let total = 0;
    for (const socketSet of this.userSockets.values()) {
      total += socketSet.size;
    }
    return total;
  }
}
