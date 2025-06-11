'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { fetchApi } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<any>;
	logout: () => Promise<void>;
	update: (user: User) => void;
	tokens: {
		accessToken: string | undefined;
		refreshToken: string | undefined;
	} | null;
	isAuthenticated: boolean;
	setAccessToken: (accessToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
	children,
	accessToken,
	refreshToken,
}: Readonly<{
	children: React.ReactNode;
	accessToken: string | undefined;
	refreshToken: string | undefined;
}>) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [tokens, setTokens] = useState<{
		accessToken: string | undefined;
		refreshToken: string | undefined;
	} | null>({
		accessToken: accessToken,
		refreshToken: refreshToken,
	});
	const router = useRouter();
	// Fetch the user profile from the API
	const fetchUserProfile = async (): Promise<User | null> => {
		try {
			const response = await fetchApi(
				'/users/profile',
				{},
				{
					accessToken: accessToken ?? undefined,
					refreshToken: refreshToken ?? undefined,
				}
			);
			if (response.status === 401) {
				return null;
			}
			return response.result;
		} catch (error) {
			console.error('Lỗi khi lấy thông tin người dùng:', error);
			router.push('/auth/login');
			return null;
		}
	};

	// Check if the user is authenticated on initial load
	useEffect(() => {
		const checkUserSession = async () => {
			setLoading(true);
			try {
				const userData = await fetchUserProfile();
				if (userData) setUser(userData);
			} catch (error) {
				console.error('Lỗi khi kiểm tra phiên đăng nhập:', error);
			} finally {
				setLoading(false);
			}
		};

		checkUserSession();
	}, []);

	// Login function
	const login = async (email: string, password: string) => {
		setLoading(true);
		const response = await fetchApi(
			'/auth/login',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			},
			{
				accessToken: undefined,
				refreshToken: undefined,
			}
		);
		console.log('🚀 ~ login ~ response:', response);
		if (response.status === 201) {
			setUser(response.result.user);
			router.push('/');
			setTokens({
				accessToken: response.result.access_token,
				refreshToken: tokens?.refreshToken,
			});
		}
		setLoading(false);
		return response;
	};

	// Logout function
	const logout = async () => {
		try {
			const response = await fetchApi(
				'/auth/logout',
				{
					method: 'POST',
				},
				{
					accessToken: accessToken,
					refreshToken: refreshToken,
				}
			);
			if (response.status === 200) {
				setUser(null);
				router.push('/auth/login');
				router.refresh();
			}
		} catch (error) {
			console.error('Lỗi đăng xuất:', error);
		}
	};

	const contextValue = useMemo<AuthContextType>(
		() => ({
			user,
			loading,
			login,
			logout,
			update: (user: User) => {
				setUser(user);
			},
			tokens: {
				accessToken: tokens?.accessToken,
				refreshToken: tokens?.refreshToken,
			},
			isAuthenticated: !!user,
			setAccessToken: (accessToken: string) => {
				setTokens({
					accessToken: accessToken,
					refreshToken: tokens?.refreshToken,
				});
			},
		}),
		[user, loading, login, logout, tokens]
	);

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth phải được sử dụng trong AuthProvider');
	}
	return context;
}
