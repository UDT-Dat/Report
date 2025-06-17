'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, Users } from 'lucide-react';

interface StatCardProps {
	readonly icon: React.ReactNode;
	readonly count: string;
	readonly label: string;
	readonly gradient: string;
}

function StatCard({ icon, count, label, gradient }: StatCardProps) {
	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
			<CardContent className="p-6 text-center">
				<div
					className={`w-12 h-12 ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}
				>
					{icon}
				</div>
				<h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{count}</h3>
				<p className="text-gray-600 dark:text-gray-300">{label}</p>
			</CardContent>
		</Card>
	);
}

export function StatsSection() {
	const stats = [
		{
			icon: <Users className="w-6 h-6 text-white" />,
			count: '500+',
			label: 'Thành viên tích cực',
			gradient: 'bg-gradient-to-r from-green-500 to-emerald-500',
		},
		{
			icon: <Calendar className="w-6 h-6 text-white" />,
			count: '50+',
			label: 'Sự kiện đã tổ chức',
			gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
		},
		{
			icon: <BookOpen className="w-6 h-6 text-white" />,
			count: '100+',
			label: 'Bài viết chia sẻ',
			gradient: 'bg-gradient-to-r from-orange-500 to-red-500',
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
			{stats.map((stat, index) => (
				<StatCard key={`stat-${index}-${Math.random().toString(36)}`} {...stat} />
			))}
		</div>
	);
}
