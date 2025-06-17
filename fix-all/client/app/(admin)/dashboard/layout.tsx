import '../../globals.css';

import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import ClientDashboardLayout from '@/components/ClientDashboardLayout';
import { getUser } from '@/lib/api';

const HEADER_HEIGHT = `4rem`;
const inter = Inter({ subsets: ['latin'] });
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('access_token')?.value;
	const refreshToken = cookieStore.get('refresh_token')?.value;
	const user = await getUser(accessToken);
	if (!accessToken || !refreshToken) {
		redirect('/access-denied');
	}
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ClientDashboardLayout tokens={{ accessToken, refreshToken }}>
					{children}
				</ClientDashboardLayout>
			</body>
		</html>
	);
}
