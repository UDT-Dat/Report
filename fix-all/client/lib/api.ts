import { jwtVerify } from 'jose';

// Đây là file giả lập API để kết nối với backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL
	? `${process.env.NEXT_PUBLIC_API_URL}/api`
	: 'http://localhost:3000/api';

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key';
const SALT_ROUNDS = 10;
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);
export async function fetchApi(
	path: string,
	options: RequestInit = {},
	tokens: { accessToken: string | undefined; refreshToken: string | undefined } | null = null
): Promise<any> {
	const isFormData = options.body instanceof FormData;

	const headers = {
		...(tokens?.accessToken ? { Authorization: `Bearer ${tokens?.accessToken}` } : {}),
		...(tokens?.refreshToken ? { cookie: `refresh_token=${tokens?.refreshToken}` } : {}),
		// Only set Content-Type to application/json if body is not FormData
		...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
		...options.headers,
	};
	const response = await fetch(`${BASE_URL}${path}`, {
		...options,
		credentials: 'include',
		headers,
	});
	// if 401 and refresh token, refresh token
	if (response.status === 401 && tokens?.refreshToken) {
		const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				cookie: `refresh_token=${tokens?.refreshToken}`,
			},
		});
		const data = await refreshResponse.json();
		return await fetchApi(path, options, {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
		});
	}
	return {
		status: response.status,
		result: await response.json(),
	};
}
export async function verifyToken(token: string): Promise<{
	name: string;
	email: string;
	sub: string;
	role: 'admin' | 'bod' | 'member';
} | null> {
	try {
		const { payload } = await jwtVerify(token, secretKey);
		const { name, email, sub, role } = payload;
		if (!name || !email || !sub || !role) {
			throw new Error('Invalid token payload');
		}

		return {
			name: name as string,
			email: email as string,
			sub: sub as string,
			role: role as 'admin' | 'bod' | 'member',
		};
	} catch (e) {
		return null;
	}
}
export async function getUser(token: string | undefined): Promise<{
	name: string;
	email: string;
	sub: string;
	role: 'admin' | 'bod' | 'member';
} | null> {
	if (!token) {
		return null;
	}
	const decoded = await verifyToken(token);
	return decoded;
}
