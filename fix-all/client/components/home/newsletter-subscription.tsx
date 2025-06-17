'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export function NewsletterSubscription() {
	const { toast } = useToast();
	const [email, setEmail] = useState('');

	const handleSubscribe = (e: React.FormEvent) => {
		e.preventDefault();
		if (email.trim()) {
			toast({
				title: 'Đăng ký thành công!',
				description: 'Cảm ơn bạn đã đăng ký nhận tin từ Văn Lang Tech Club.',
				variant: 'success',
			});
			setEmail('');
		}
	};

	return (
		<Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
			<CardContent className="p-6">
				<div className="text-center mb-4">
					<Mail className="w-8 h-8 mx-auto mb-3 opacity-90" />
					<h3 className="text-lg font-bold mb-2">Đăng ký nhận tin</h3>
					<p className="text-blue-100 text-sm">
						Nhận thông báo về các sự kiện và bài viết mới nhất từ Văn Lang Tech Club
					</p>
				</div>
				<form onSubmit={handleSubscribe} className="space-y-3">
					<Input
						type="email"
						placeholder="Email của bạn"
						className="bg-white/20 border-white/30 text-white placeholder:text-blue-100 focus:bg-white/30 focus:border-white/50"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<Button
						type="submit"
						className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
					>
						Đăng ký ngay
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
