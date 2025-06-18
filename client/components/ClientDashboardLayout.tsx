'use client';

import { useState } from 'react';

import { LogOut } from 'lucide-react';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';

import AppSidebar from '@/components/AdminSidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { fetchApi } from '@/lib/api';
import { AuthProvider } from '@/lib/auth-provider';
import { cn } from '@/lib/utils';

const HEADER_HEIGHT = `4rem`;
const inter = Inter({ subsets: ['latin'] });
export default function ClientDashboardLayout({
	children,
	tokens,
}: {
	children: React.ReactNode;
	tokens: {
		accessToken: string;
		refreshToken: string;
	};
}) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<AuthProvider accessToken={tokens.accessToken} refreshToken={tokens.refreshToken}>
				<div className="min-h-screen flex flex-col">
					<main className="flex-1 flex flex-col">
						<div className="flex-1 flex">
							<SidebarProvider open={open} onOpenChange={setOpen}>
								<AppSidebar />
								<SidebarInset
									className={cn(
										open
											? 'w-[calc(100%-var(--sidebar-width)-var(--sidebar-width-icon))]'
											: 'w-[calc(100%-var(--sidebar-width-icon))]',
										'flex flex-col'
									)}
								>
									<div
										className="sticky top-0 z-50 flex items-center gap-4 border-b bg-background h-[calc(var(--header-height))] px-6"
										style={{
											['--header-height' as string]: HEADER_HEIGHT,
										}}
									>
										<SidebarTrigger />
										<div className="flex flex-1 items-center gap-4 justify-between ">
											<h1 className="text-xl font-semibold">Dashboard</h1>
											<Button
												variant="destructive"
												onClick={async () => {
													try {
														// clear cookies for accessToken and refreshToken
														document.cookie =
															'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
														document.cookie =
															'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
														document.cookie = "user_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
														// const response = await fetchApi(
														// 	'/auth/logout',
														// 	{
														// 		method: 'POST',
														// 	},
														// 	{
														// 		accessToken: tokens.accessToken,
														// 		refreshToken: tokens.refreshToken,
														// 	}
														// );
													} catch (error) {
														console.error('Lỗi đăng xuất:', error);
													} finally {
														router.push('/auth/login');
														router.refresh();
													}
												}}
											>
												<LogOut className="mr-2 h-4 w-4" />
												Logout
											</Button>
										</div>
									</div>
									<div
										className="flex-1 overflow-auto"
										style={{
											['--header-height' as string]: HEADER_HEIGHT,
										}}
									>
										{children}
									</div>
								</SidebarInset>
							</SidebarProvider>
						</div>
					</main>
				</div>
				<Toaster />
			</AuthProvider>
		</ThemeProvider>
	);
}
