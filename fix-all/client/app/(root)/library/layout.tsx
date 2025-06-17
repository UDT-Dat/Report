import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LibraryLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const cookieStore = await cookies()
	const accessToken = cookieStore.get('access_token')?.value
	const refreshToken = cookieStore.get('refresh_token')?.value
	if (!accessToken && !refreshToken) {
		redirect('/auth/login')
	}
	return <>{children}</>
}
