export function parseImageUrl(image?: string) {
	let imageUrl;
	if (image?.includes('https://') || image?.includes('http://')) {
		imageUrl = image;
	} else if (!image) {
		imageUrl = '/placeholder.svg';
	} else {
		const sanitizedImage = image.startsWith('/') ? image.slice(1) : image;
		imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${sanitizedImage}`;
	}
	return imageUrl;
}

export function parseUrl(url?: string) {
	if (!url) return '';
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url;
	}
	return `${process.env.NEXT_PUBLIC_API_URL}/${url}`;
}
