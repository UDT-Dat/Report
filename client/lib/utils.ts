import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { fetchApi } from '@/lib/api';
import { parseImageUrl } from './parseImageUrl';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	};
	return new Date(date).toLocaleString('vi-VN', options);
}
export const getBadgeStatus = (
	startDate: string,
	endDate: string
): 'upcoming' | 'ongoing' | 'past' => {
	const now = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (now < start) {
		return 'upcoming';
	} else if (now >= start && now <= end) {
		return 'ongoing';
	} else {
		return 'past';
	}
};
export const getQueryFromStatus = (status: string) => {
	switch (status) {
		case 'upcoming':
			return { startDate_gte: new Date().getTime() };
		case 'ongoing':
			return { startDate_lte: new Date().getTime(), endDate_gte: new Date().getTime() };
		case 'past':
			return { endDate_lte: new Date().getTime() };
		default:
			return {};
	}
};
export function formatBytes(size: number): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let index = 0;
	let formattedSize = size;

	while (formattedSize >= 1024 && index < units.length - 1) {
		formattedSize /= 1024;
		index++;
	}
	return `${formattedSize.toFixed(2)} ${units[index]}`;
}
export function getParserDOM(htmlString: string) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, 'text/html');

	return doc;
}
export async function blobUrlToFile(blobUrl: string, fileName: string) {
	const response = await fetch(blobUrl);
	const blob = await response.blob();
	return new File([blob], fileName, { type: blob.type });
}
export const uploadImage = async (
	formData: FormData,
	token: {
		accessToken: string;
		refreshToken: string;
	}
) => {
	const res = await fetchApi(
		`/image/single`,
		{
			body: formData,
			method: 'POST',
		},
		{
			accessToken: token.accessToken,
			refreshToken: token.refreshToken,
		}
	);
	return res.result;
};
export const uploadImages = async (
	formData: FormData,
	token: {
		accessToken: string;
		refreshToken: string;
	}
) => {
	const res = await fetchApi(
		`/image/multiple`,
		{
			body: formData,
			method: 'POST',
		},
		{
			accessToken: token.accessToken,
			refreshToken: token.refreshToken,
		}
	);
	return res.result;
};

export async function updateContent(
	htmlString: string,
	tokens: {
		accessToken: string;
		refreshToken: string;
	}
): Promise<string> {
	if (!htmlString) return '';

	const doc = getParserDOM(htmlString);
	const images = doc.querySelectorAll('img');

	for (const image of images) {
		const src = image.getAttribute('src');

		// Bỏ qua ảnh không phải blob, hoặc đã là ảnh Cloudinary
		if (src && !src.startsWith('blob:') && (src.startsWith('http') || src.startsWith('//'))) {
			continue;
		}

		if (src?.startsWith('blob:')) {
			const file = await blobUrlToFile(src, `image-${Date.now()}.jpg`);
			const formData = new FormData();
			formData.append('image', file);

			const res = await uploadImage(formData, {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
			});

			if (res?.url || res?.secure_url) {
				image.setAttribute('src', res.secure_url || res.url);
			} else {
				throw new Error('Failed to upload image to Cloudinary');
			}
		}
	}

	return doc.body.innerHTML;
}

export const updateSrcImage = (htmlString: string): string => {
	const doc = getParserDOM(htmlString);
	const images = doc.querySelectorAll('img');
	for (const image of images) {
		const src = image.getAttribute('src');
		image.setAttribute('src', parseImageUrl(src ?? undefined));
	}
	return doc.body.innerHTML;
};

export function updateHtml(htmlContent: string): string {
	let processedContent = updateSrcImage(htmlContent);

	const parser = new DOMParser();
	const doc = parser.parseFromString(processedContent, 'text/html');

	const allElements = doc.querySelectorAll('*');
	allElements.forEach((element) => {
		element.removeAttribute('style');
	});

	return doc.body.innerHTML;
}

export function getQuery(searchParams: URLSearchParams, ignoreKey?: string[]) {
	return Array.from(searchParams.entries())
		.map(([key, value]) => {
			if (['page', 'limit', ...(ignoreKey ? ignoreKey : [])].includes(key)) {
				return undefined;
			}
			return `${key}=${value}`;
		})
		.filter(Boolean)
		.join('&');
}
