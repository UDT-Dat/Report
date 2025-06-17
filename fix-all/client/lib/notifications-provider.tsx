"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  io,
  Socket,
} from 'socket.io-client';

import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';

interface SimpleNotification {
	title: string;
	message: string;
	timestamp: string;
}

interface NotificationsContextType {
	socket: Socket | null;
	isConnected: boolean;
	latestNotification: SimpleNotification | null;
	unreadCount: number;
	setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
	markAsRead: () => void;
	refetchUnreadCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
	children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [latestNotification, setLatestNotification] = useState<SimpleNotification | null>(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const { tokens, isAuthenticated } = useAuth();
	const { toast } = useToast()

	// Function to fetch unread count
	const refetchUnreadCount = async () => {
		if (!isAuthenticated || !tokens) return;
		
		try {
			const response = await fetchApi(`/notifications?isRead=false`, { method: 'GET' }, tokens)
			if (response.status === 200) {
				const unreadNotifications = response.result;
				setUnreadCount(unreadNotifications.length);
				console.log('🔔 Fetched unread count:', unreadNotifications.length);
			}
		} catch (error) {
			console.error('Error fetching unread count:', error);
		}
	};

	// Fetch initial unread count
	useEffect(() => {
		refetchUnreadCount();
	}, [isAuthenticated, tokens])

	useEffect(() => {
		if (!isAuthenticated || !tokens?.accessToken) {
			console.log('🔐 Not authenticated or no token available');
			return;
		}

		console.log('🚀 Starting WebSocket connection...');
		console.log('🔑 Access Token:', tokens.accessToken.substring(0, 50) + '...');

		// Backend server URL (NestJS server)
		const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
		console.log('🌐 Connecting to:', `${BACKEND_URL}/notifications`);
		
		const newSocket = io(`${BACKEND_URL}/notifications`, {
			auth: {
				token: tokens.accessToken
			},
			autoConnect: true,
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5,
			transports: ['websocket', 'polling'], // Ensure both transports are available
		});

		// Connection events
		newSocket.on('connect', () => {
			console.log('✅ Connected to notifications:', newSocket.id);
			setIsConnected(true);
		});

		newSocket.on('disconnect', (reason) => {
			console.log('❌ Disconnected from notifications:', reason);
			setIsConnected(false);
		});

		newSocket.on('connect_error', (error) => {
			console.error('🚫 WebSocket connection error:', error.message);
			console.error('🚫 Error details:', error);
			setIsConnected(false);
		});

		// Listen for authentication errors from server
		newSocket.on('auth_error', (error) => {
			console.error('🔐 Authentication error from server:', error);
			console.error('🔐 Token might be invalid or expired');
		});

		// Listen for new notifications
		newSocket.on('newNotification', (notification: SimpleNotification) => {
			console.log('📧 New notification received:', notification);

			setLatestNotification(notification);
			setUnreadCount(prev => {
				const newCount = prev + 1;
				console.log('🔔 Incrementing unread count from', prev, 'to', newCount);
				return newCount;
			});
			// Show toast notification
			toast({
				title: notification.title,
				description: notification.message,
				duration: 5000,
			});
		});

		setSocket(newSocket);

		return () => {
			console.log('🔌 Cleaning up WebSocket connection');
			newSocket.off('connect');
			newSocket.off('disconnect');
			newSocket.off('connect_error');
			newSocket.off('auth_error');
			newSocket.off('newNotification');
			newSocket.close();
		};
	}, [isAuthenticated, tokens?.accessToken, toast]);

	const markAsRead = () => {
		setUnreadCount(prev => {
			const newCount = Math.max(0, prev - 1);
			console.log('🔔 Decrementing unread count from', prev, 'to', newCount);
			return newCount;
		});
	};

	const value = {
		socket,
		isConnected,
		latestNotification,
		unreadCount,
		setUnreadCount,
		markAsRead,
		refetchUnreadCount,
	};

	return (
		<NotificationsContext.Provider value={value}>
			{children}
		</NotificationsContext.Provider>
	);
};

export const useNotifications = (): NotificationsContextType => {
	const context = useContext(NotificationsContext);
	if (context === undefined) {
		throw new Error('useNotifications must be used within a NotificationsProvider');
	}
	return context;
}; 