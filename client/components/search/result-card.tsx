'use client';

import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { parseImageUrl } from '@/lib/parseImageUrl';
import { Highlight, SearchResult, SearchResultType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Book, Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Utility function to strip HTML tags and truncate text
export const stripHtmlAndTruncate = (html: string, maxLength = 150): string => {
	if (!html) return '';

	// More thorough HTML tag removal (handles attributes, nested tags, etc.)
	const text = html
		.replace(/<[^>]*>/g, ' ') // Replace tags with spaces to avoid word joining
		.replace(/\s+/g, ' ') // Normalize spaces
		.trim();

	// Decode common HTML entities
	const decoded = text
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&mdash;/g, '—')
		.replace(/&ndash;/g, '–');

	// Truncate and add ellipsis if needed
	if (decoded.length <= maxLength) return decoded;
	return decoded.substring(0, maxLength).trim() + '...';
};

// Function to apply highlights to truncated text
export const applyHighlightsToText = (
	text: string,
	highlights: Highlight[],
	path: string
): React.ReactNode => {
	const relevantHighlight = highlights.find((h) => h.path === path);
	if (!relevantHighlight) return text;

	// Simple highlighting - find the highlighted terms in the text
	const result: React.ReactNode[] = [];
	let lastIndex = 0;

	relevantHighlight.texts.forEach((textPart, index) => {
		if (textPart.type === 'hit') {
			// Find this hit in our truncated text
			const hitIndex = text.toLowerCase().indexOf(textPart.value.toLowerCase(), lastIndex);
			if (hitIndex !== -1) {
				// Add text before the hit
				if (hitIndex > lastIndex) {
					result.push(text.substring(lastIndex, hitIndex));
				}
				// Add the highlighted hit
				result.push(
					<span
						key={`highlight-${new Date().getTime()}-${index}`}
						className="bg-yellow-200 dark:bg-yellow-800 font-medium px-0.5 rounded"
					>
						{text.substring(hitIndex, hitIndex + textPart.value.length)}
					</span>
				);
				lastIndex = hitIndex + textPart.value.length;
			}
		}
	});

	// Add remaining text
	if (lastIndex < text.length) {
		result.push(text.substring(lastIndex));
	}

	return result.length > 0 ? result : text;
};

export function ResultCard({ result }: Readonly<{ result: SearchResult }>) {
	const [imageError, setImageError] = useState(false);

	// Get icon based on result type
	const getResultIcon = (type: SearchResultType) => {
		switch (type) {
			case 'User':
				return <User className="h-5 w-5 text-blue-500" />;
			case 'Event':
				return <Calendar className="h-5 w-5 text-purple-500" />;
			case 'Post':
				return <FileText className="h-5 w-5 text-green-500" />;
			case 'Library':
				return <Book className="h-5 w-5 text-orange-500" />;
		}
	};

	// Get badge based on result type
	const getResultBadge = (type: SearchResultType) => {
		switch (type) {
			case 'User':
				return (
					<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
						Người dùng
					</Badge>
				);
			case 'Event':
				return (
					<Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
						Sự kiện
					</Badge>
				);
			case 'Post':
				return (
					<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
						Bài viết
					</Badge>
				);
			case 'Library':
				return (
					<Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
						Thư viện
					</Badge>
				);
		}
	};

	// Render highlighted text
	const renderHighlightedText = (highlight: Highlight) => {
		return highlight.texts.map((text) => (
			<span
				key={`${text.type}-${text.value}`}
				className={
					text.type === 'hit' ? 'bg-yellow-200 dark:bg-yellow-800 font-medium px-0.5 rounded' : ''
				}
			>
				{text.value}
			</span>
		));
	};

	return (
		<Link href={result.url ?? '#'}>
			<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 my-5">
				<CardContent className="p-4 flex items-start gap-4">
					{(() => {
						let imageContent: React.ReactNode;

						if (result.image && !imageError) {
							imageContent = (
								<div className="relative h-12 w-12 rounded-lg overflow-hidden">
									<img
										src={parseImageUrl(result.image)}
										alt={result.title}
										className="h-full w-full object-cover"
										onError={() => setImageError(true)}
									/>
								</div>
							);
						} else if (result.type === 'User') {
							imageContent = (
								<Avatar className="h-12 w-12 rounded-full">
									<AvatarImage src="/placeholder.svg" alt={result.title} />
									<AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
										{result.title.charAt(0)}
									</AvatarFallback>
								</Avatar>
							);
						} else {
							let bgClass = '';
							if (result.type === 'Event') {
								bgClass = 'bg-purple-100 dark:bg-purple-900/30';
							} else if (result.type === 'Post') {
								bgClass = 'bg-green-100 dark:bg-green-900/30';
							} else {
								bgClass = 'bg-orange-100 dark:bg-orange-900/30';
							}
							imageContent = (
								<div
									className={cn('h-12 w-12 rounded-lg flex items-center justify-center', bgClass)}
								>
									{getResultIcon(result.type)}
								</div>
							);
						}

						return imageContent;
					})()}

					<div className="flex-1">
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-2">
								{getResultBadge(result.type)}
								{result.date && (
									<span className="text-xs text-gray-500 dark:text-gray-400">
										{new Date(result.date).toLocaleDateString('vi-VN')}
									</span>
								)}
							</div>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								Độ chính xác: {Math.round(result.score * 100)}%
							</span>
						</div>

						<h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
							{result.highlights.some((h) => h.path === 'title')
								? renderHighlightedText(result.highlights.find((h) => h.path === 'title')!)
								: result.title}
						</h3>

						<p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
							{(() => {
								if (result.type === 'Post') {
									// For posts, strip HTML and truncate content
									const cleanText = stripHtmlAndTruncate(result.description, 120);

									// Apply highlights if available
									if (
										result.highlights.some((h) => h.path === 'content' || h.path === 'description')
									) {
										const highlight = result.highlights.find(
											(h) => h.path === 'content' || h.path === 'description'
										);
										if (highlight) {
											return applyHighlightsToText(cleanText, [highlight], highlight.path);
										}
									}

									return cleanText;
								} else {
									// For other types, use the existing logic but still strip HTML
									if (result.highlights.some((h) => h.path === 'description')) {
										const highlight = result.highlights.find((h) => h.path === 'description')!;
										// Clean the highlighted text parts
										const cleanedHighlight = {
											...highlight,
											texts: highlight.texts.map((text) => ({
												...text,
												value: stripHtmlAndTruncate(text.value, text.value.length),
											})),
										};
										return renderHighlightedText(cleanedHighlight);
									}
									return stripHtmlAndTruncate(result.description);
								}
							})()}
						</p>

						{/* Show other highlighted fields if any */}
						{result.highlights
							.filter((h) => !['title', 'description', 'content'].includes(h.path))
							.map((highlight) => {
								const cleanedHighlight = {
									...highlight,
									texts: highlight.texts.map((text) => ({
										...text,
										value: stripHtmlAndTruncate(text.value, text.value.length),
									})),
								};

								return (
									<div
										key={highlight.path}
										className="mt-1 text-sm text-gray-500 dark:text-gray-400"
									>
										<span className="font-medium">{highlight.path}: </span>
										{renderHighlightedText(cleanedHighlight)}
									</div>
								);
							})}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
