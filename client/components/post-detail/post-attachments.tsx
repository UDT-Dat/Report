'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Download, FileText } from 'lucide-react';

interface Attachment {
	readonly _id: string;
	readonly originalname?: string;
	readonly size?: number;
	readonly createdAt?: string;
	readonly path?: string;
	readonly url: string;
}

interface PostAttachmentsProps {
	attachments: Attachment[];
}

export function PostAttachments({ attachments }: PostAttachmentsProps) {
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	if (!attachments || attachments.length === 0) {
		return null;
	}

	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5 text-blue-500" />
					File đính kèm ({attachments.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					{attachments.map((attachment) => (
						<div
							key={attachment._id}
							className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
						>
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
									<FileText className="w-6 h-6 text-white" />
								</div>
								<div>
									<p className="font-medium text-gray-800 dark:text-gray-100">
										{attachment.originalname ?? 'File đính kèm'}
									</p>
									<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
										<span>{formatBytes(attachment.size ?? 0)}</span>
										<span>•</span>
										<span>{formatDate(attachment.createdAt ?? new Date().toISOString())}</span>
									</div>
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
								onClick={async () => {
									try {
										const response = await fetch(attachment.url);
										const blob = await response.blob();
										const url = window.URL.createObjectURL(blob);
										const link = document.createElement('a');
										link.href = url;
										link.download = attachment.originalname ?? 'download';
										document.body.appendChild(link);
										link.click();
										document.body.removeChild(link);
										window.URL.revokeObjectURL(url);
									} catch (error) {
										console.error('Download failed:', error);
									}
								}}
							>
								<Download className="h-4 w-4" />
								Download
							</Button>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
