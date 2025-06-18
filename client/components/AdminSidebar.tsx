import { BookAIcon, Calendar, Home, Library, Users } from 'lucide-react';
import Link from 'next/link';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/lib/auth-provider';
const items = [
	{
		title: 'Manage events',
		url: '/dashboard/bod/events',
		icon: Calendar,
		permissions: ['bod'],
	},
	{
		title: 'Manage posts',
		url: '/dashboard/bod/posts',
		icon: BookAIcon,
		permissions: ['bod'],
	},
	{
		title: 'Manage libraries',
		url: '/dashboard/bod/libraries',
		icon: Library,
		permissions: ['bod'],
	},
	{
		title: 'Manage libraries',
		url: '/dashboard/admin/libraries',
		icon: Library,
		permissions: ['admin'],
	},
	{
		title: 'Manage users',
		url: '/dashboard/admin/users',
		icon: Users,
		permissions: ['admin'],
	},
	{
		title: 'Manage users',
		url: '/dashboard/bod/users',
		icon: Users,
		permissions: ['bod'],
	},
	{
		title: 'Home',
		url: '/',
		icon: Home,
		permissions: ['admin', 'bod'],
	},
];
export default function AdminSidebar() {
	const { user } = useAuth();
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Dashboard</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => {
								if (item.permissions.includes(user?.role ?? '')) {
									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<Link href={item.url}>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								}
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
