import { getUser } from '@/lib/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('access_token')?.value;
	const user = await getUser(accessToken);

	if (user?.role !== 'admin') {
		redirect('/access-denied');
	}
	return <>{children}</>;
}
