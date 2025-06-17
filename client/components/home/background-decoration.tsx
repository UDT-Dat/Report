'use client';

export function BackgroundDecoration() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
			<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
		</div>
	);
}
