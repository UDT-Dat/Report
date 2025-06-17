import '../globals.css';

import type React from 'react';

import type { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth-provider';
import { NotificationsProvider } from '@/lib/notifications-provider';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Văn Lang Tech Club",
  description: "Cổng thông tin của Văn Lang Tech Club - Đại học Văn Lang",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider accessToken={accessToken} refreshToken={refreshToken}>
            <NotificationsProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 bg-gray-50 dark:bg-gray-900">{children}</main>
                <Footer />
              </div>
            </NotificationsProvider>
            <Toaster/>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
