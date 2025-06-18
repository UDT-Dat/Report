'use client';

import type React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPinIcon, Phone } from 'lucide-react';

interface ContactItemProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	href: string;
	colorClass: string;
}

function ContactItem({ icon, label, value, href, colorClass }: ContactItemProps) {
	return (
		<div className="flex items-start space-x-3">
			<div className={`w-5 h-5 ${colorClass} mt-0.5`}>{icon}</div>
			<div>
				<p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
				<a href={href} className={`text-sm ${colorClass} hover:underline`}>
					{value}
				</a>
			</div>
		</div>
	);
}

export function ContactInfo() {
	const contacts = [
		{
			icon: <Mail className="w-5 h-5" />,
			label: 'Email',
			value: 'k.cntt-itclub@vanlanguni.vn',
			href: 'mailto:k.cntt-itclub@vanlanguni.vn',
			colorClass: 'text-blue-500 dark:text-blue-400',
		},
		{
			icon: <Phone className="w-5 h-5" />,
			label: 'Điện thoại',
			value: '028.7109 9221',
			href: 'tel:02871099221',
			colorClass: 'text-green-500 dark:text-green-400',
		},
		{
			icon: <MapPinIcon className="w-5 h-5" />,
			label: 'Địa chỉ',
			value: '69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh',
			href: 'https://maps.google.com/?q=69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh',
			colorClass: 'text-red-500 dark:text-red-400',
		},
	];

	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
			<CardHeader>
				<CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
					Liên hệ
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{contacts.map((contact, index) => (
					<ContactItem key={`contact-${index}-${Math.random().toString(36)}`} {...contact} />
				))}
			</CardContent>
		</Card>
	);
}
