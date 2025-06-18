'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { LibraryItem } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const libraryFormSchema = z.object({
	title: z.string().min(1, 'Tiêu đề là bắt buộc').max(100, 'Tiêu đề không được quá 100 ký tự'),
	description: z.string().min(1, 'Mô tả là bắt buộc').max(500, 'Mô tả không được quá 500 ký tự'),
});

type LibraryFormValues = z.infer<typeof libraryFormSchema>;

interface LibraryEditSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	library: LibraryItem | null;
	onSubmit: (values: LibraryFormValues) => Promise<void>;
}

export function LibraryEditSheet({ open, onOpenChange, library, onSubmit }: LibraryEditSheetProps) {
	const form = useForm<LibraryFormValues>({
		resolver: zodResolver(libraryFormSchema),
		defaultValues: {
			title: library?.title || '',
			description: library?.description || '',
		},
	});

	// Reset form when library changes
	React.useEffect(() => {
		if (library) {
			form.reset({
				title: library.title,
				description: library.description,
			});
		}
	}, [library, form]);

	const handleSubmit = async (values: LibraryFormValues) => {
		await onSubmit(values);
		onOpenChange(false);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-2xl">
				<SheetHeader className="space-y-3">
					<SheetTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
						Chỉnh sửa thư viện
					</SheetTitle>
					<SheetDescription className="text-gray-600 dark:text-gray-300">
						Cập nhật thông tin thư viện. Nhấn "Lưu thay đổi" khi hoàn tất.
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-gray-700 dark:text-gray-300">
											Tiêu đề thư viện
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Nhập tiêu đề thư viện..."
												{...field}
												className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20"
											/>
										</FormControl>
										<FormDescription className="text-gray-500 dark:text-gray-400">
											Tên hiển thị của thư viện (tối đa 100 ký tự)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-gray-700 dark:text-gray-300">Mô tả</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Nhập mô tả về thư viện..."
												className="min-h-[120px] resize-none bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20"
												{...field}
											/>
										</FormControl>
										<FormDescription className="text-gray-500 dark:text-gray-400">
											Mô tả chi tiết về mục đích và nội dung của thư viện (tối đa 500 ký tự)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
								>
									Hủy
								</Button>
								<Button
									type="submit"
									disabled={form.formState.isSubmitting}
									className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
								>
									{form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	);
}
