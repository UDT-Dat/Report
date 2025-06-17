import { NextRequest, NextResponse } from 'next/server';
import { UserStatus } from './lib/types';

const PROTECTED_PATHS = ['/', '/dashboard', '/profile'];
const VERIFY_STUDENT_PATH = '/auth/verify-student';

export function middleware(request: NextRequest) {
	const accessToken = request.cookies.get('access_token')?.value;
	const refreshToken = request.cookies.get('refresh_token')?.value;

	// Nếu không có token => clear all known cookies and allow access
	if (!accessToken || !refreshToken) {
		const response = NextResponse.next();

		// Manually clear known cookies
		response.cookies.set('access_token', '', {
			path: '/',
			expires: new Date(0),
		});
		response.cookies.set('refresh_token', '', {
			path: '/',
			expires: new Date(0),
		});
		response.cookies.set('user_status', '', {
			path: '/',
			expires: new Date(0),
		});

		return response;
	}

	if (request.nextUrl.pathname.startsWith(VERIFY_STUDENT_PATH)) {
		return NextResponse.next();
	}

	const userStatus = request.cookies.get('user_status')?.value;

	if (
		userStatus === UserStatus.PENDING ||
		userStatus === UserStatus.VERIFYING ||
		userStatus === UserStatus.REJECTED
	) {
		const url = request.nextUrl.clone();
		url.pathname = VERIFY_STUDENT_PATH;
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next|favicon.ico|auth|api|images).*)'],
};
