'use client';

import { BackgroundDecoration } from '@/components/home/background-decoration';
import { ContactInfo } from '@/components/home/contact-info';
import { EventsSidebar } from '@/components/home/events-sidebar';
import { HeroSection } from '@/components/home/hero-section';
import { NewsletterSubscription } from '@/components/home/newsletter-subscription';
import { StatsSection } from '@/components/home/stats-section';
import { FeaturedPost } from '@/components/post/featured-post';
import { PostGrid } from '@/components/post/post-grid';
import { fetchApi } from '@/lib/api';
import type { Event, Post } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function Home() {
	const [heroPost, setHeroPost] = useState<Post | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchPosts() {
			try {
				const response = await fetchApi('/posts?page=1&limit=10', { method: 'GET' });
				if (response.status === 200) {
					setPosts(response.result.posts ?? []);
				} else {
					setPosts([]);
				}
			} catch {
				setPosts([]);
			}
		}
		async function fetchPriorityPosts() {
			try {
				const response = await fetchApi('/posts/home/priority?page=1&limit=5', { method: 'GET' });
				if (response.status === 200) {
					const priorityPosts = response.result.posts ?? [];
					if (priorityPosts.length > 0) {
						setHeroPost(priorityPosts[0]);
						setPosts((prevPosts) => [...priorityPosts, ...prevPosts]);
					} else {
						setHeroPost(null);
					}
				}
			} catch {
				setHeroPost(null);
			}
		}
		async function fetchEvents() {
			try {
				const response = await fetchApi('/events?page=1&limit=5', { method: 'GET' });
				if (response.status === 200) {
					setEvents(response.result.events ?? []);
				} else {
					setEvents([]);
				}
			} catch {
				setEvents([]);
			}
		}
		Promise.all([fetchPriorityPosts(), fetchPosts(), fetchEvents()]).finally(() => {
			setLoading(false);
		});
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
			<BackgroundDecoration />

			<div className="container mx-auto px-4 py-8 relative">
				<HeroSection />
				<StatsSection />

				{/* Main Content */}
				<div className="grid gap-8 lg:grid-cols-3">
					{/* Featured Content */}
					<div className="lg:col-span-2 space-y-8">
						<FeaturedPost post={heroPost || posts[0]} loading={loading} />
						<PostGrid posts={posts} loading={loading} />
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						<EventsSidebar events={events} loading={loading} />
						<NewsletterSubscription />
						<ContactInfo />
					</div>
				</div>
			</div>
		</div>
	);
}
