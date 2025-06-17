'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Post } from '@/lib/types';
import { useState } from 'react';

interface RejectReasonDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	post: Post | null;
	onConfirm: (reason: string) => void;
}

const REJECT_REASONS = [
	{ value: 'inappropriate_content', label: 'Nội dung không phù hợp' },
	{ value: 'spam', label: 'Spam hoặc quảng cáo' },
	{ value: 'copyright', label: 'Vi phạm bản quyền' },
	{ value: 'low_quality', label: 'Chất lượng nội dung thấp' },
	{ value: 'off_topic', label: 'Không đúng chủ đề' },
	{ value: 'duplicate', label: 'Nội dung trùng lặp' },
	{ value: 'other', label: 'Lý do khác' },
];

export function RejectReasonDialog({
	open,
	onOpenChange,
	post,
	onConfirm,
}: RejectReasonDialogProps) {
	const [selectedReason, setSelectedReason] = useState('');
	const [customReason, setCustomReason] = useState('');

	const handleConfirm = () => {
		const reason =
			selectedReason === 'other'
				? customReason
				: REJECT_REASONS.find((r) => r.value === selectedReason)?.label || '';
		if (reason.trim()) {
			onConfirm(reason);
			setSelectedReason('');
			setCustomReason('');
		}
	};

	const handleCancel = () => {
		setSelectedReason('');
		setCustomReason('');
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>Từ chối bài viết</AlertDialogTitle>
					<AlertDialogDescription>
						Vui lòng chọn lý do từ chối bài viết "{post?.title}". Lý do này sẽ được gửi đến tác giả.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-4">
					<div>
						<Label className="text-sm font-medium">Lý do từ chối</Label>
						<RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
							{REJECT_REASONS.map((reason) => (
								<div key={reason.value} className="flex items-center space-x-2">
									<RadioGroupItem value={reason.value} id={reason.value} />
									<Label htmlFor={reason.value} className="text-sm font-normal cursor-pointer">
										{reason.label}
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>

					{selectedReason === 'other' && (
						<div>
							<Label htmlFor="custom-reason" className="text-sm font-medium">
								Lý do cụ thể
							</Label>
							<Textarea
								id="custom-reason"
								placeholder="Nhập lý do từ chối..."
								value={customReason}
								onChange={(e) => setCustomReason(e.target.value)}
								className="mt-1"
								rows={3}
							/>
						</div>
					)}
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleCancel}>Hủy</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
						className="bg-orange-600 hover:bg-orange-700"
					>
						Từ chối bài viết
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
