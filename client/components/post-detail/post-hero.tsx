'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { parseImageUrl } from '@/lib/parseImageUrl';

interface PostHeroProps {
	readonly bannerImage?: string;
	readonly title: string;
}

export function PostHero({ bannerImage, title }: PostHeroProps) {
	const imageUrl = parseImageUrl(bannerImage);

	return (
		<>
			{/* Hero Image with Dialog */}
			{bannerImage && (
				<Dialog>
					<DialogTrigger asChild>
						<div className="relative mb-8 overflow-hidden rounded-2xl shadow-2xl cursor-zoom-in">
							<img src={imageUrl} alt={title} className="aspect-[16/9] w-full object-cover" />
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
						</div>
					</DialogTrigger>
					<DialogContent className="max-w-fit p-0 bg-transparent border-none shadow-none">
						<img
							src={imageUrl}
							alt={title}
							className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl cursor-zoom-out"
						/>
					</DialogContent>
				</Dialog>
			)}

			{/* Title */}
			<h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight">
				{title}
			</h1>
		</>
	);
}
