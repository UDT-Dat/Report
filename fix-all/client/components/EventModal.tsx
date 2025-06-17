'use client';

import type React from 'react';

import { useEffect, useState } from 'react';

import { Calendar, MapPin, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { parseImageUrl, parseUrl } from '@/lib/parseImageUrl';
import type { CreateEventData, UpdateEventData } from '@/lib/services/eventService';
import type { Event } from '@/lib/types';

// Default location options
const DEFAULT_LOCATIONS = [
	'45 Nguyễn Khắc Nhu, Phường Cô Giang, Quận 1, Hồ Chí Minh, Việt Nam',
	'233A Đ. Phan Văn Trị, Phường 11, Bình Thạnh, Hồ Chí Minh, Việt Nam',
	'69/68 Đ. Đặng Thuỳ Trâm, Phường 13, Bình Thạnh, Hồ Chí Minh, Việt Nam',
	'Khác', // Special option for custom location
];

interface EventModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onSubmit: (data: CreateEventData | UpdateEventData) => Promise<void>;
	readonly event?: Event | null;
	readonly isLoading?: boolean;
}

export default function EventModal({
	isOpen,
	onClose,
	onSubmit,
	event,
	isLoading = false,
}: EventModalProps) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		location: '',
		startDate: '',
		endDate: '',
		maxParticipants: '',
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>('');
	const [selectedLocation, setSelectedLocation] = useState<string>('');
	const [customLocation, setCustomLocation] = useState<string>('');
	const [showCustomLocation, setShowCustomLocation] = useState(false);

	useEffect(() => {
		if (event) {
			setFormData({
				title: event.title || '',
				description: event.description || '',
				location: event.location || '',
				startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
				endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
				maxParticipants: event.maxParticipants?.toString() || '',
			});

			// Check if the event location matches any default location
			if (event.location) {
				const isDefaultLocation = DEFAULT_LOCATIONS.includes(event.location);
				if (isDefaultLocation) {
					setSelectedLocation(event.location);
					setShowCustomLocation(false);
				} else {
					setSelectedLocation('Khác');
					setCustomLocation(event.location);
					setShowCustomLocation(true);
				}
			}

			if (event.imageUrl) {
				setPreviewUrl(parseImageUrl(event.imageUrl));
			}
		} else {
			setFormData({
				title: '',
				description: '',
				location: '',
				startDate: '',
				endDate: '',
				maxParticipants: '',
			});
			setPreviewUrl('');
			setSelectedFile(null);
			setSelectedLocation('');
			setCustomLocation('');
			setShowCustomLocation(false);
		}
	}, [event, isOpen]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleLocationChange = (value: string) => {
		setSelectedLocation(value);

		if (value === 'Khác') {
			setShowCustomLocation(true);
			setFormData((prev) => ({
				...prev,
				location: customLocation,
			}));
		} else {
			setShowCustomLocation(false);
			setFormData((prev) => ({
				...prev,
				location: value,
			}));
		}
	};

	const handleCustomLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCustomLocation(value);
		setFormData((prev) => ({
			...prev,
			location: value,
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		}
	};

	const removeFile = () => {
		setSelectedFile(null);
		setPreviewUrl('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const submitData: CreateEventData | UpdateEventData = {
			title: formData.title,
			description: formData.description,
			location: formData.location,
			startDate: formData.startDate,
			endDate: formData.endDate,
			maxParticipants: formData.maxParticipants
				? Number.parseInt(formData.maxParticipants)
				: undefined,
		};

		if (selectedFile) {
			submitData.file = selectedFile;
		}

		await onSubmit(submitData);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{event ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</DialogTitle>
					<DialogDescription>
						{event
							? 'Cập nhật thông tin sự kiện của bạn'
							: 'Điền thông tin để tạo sự kiện mới cho CLB IT VLU'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="title">Tên sự kiện *</Label>
						<Input
							id="title"
							name="title"
							value={formData.title}
							onChange={handleInputChange}
							placeholder="Nhập tên sự kiện..."
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Mô tả *</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							placeholder="Mô tả chi tiết về sự kiện..."
							rows={4}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="location">Địa điểm *</Label>
						<div className="space-y-3">
							<div className="relative">
								<Select value={selectedLocation} onValueChange={handleLocationChange}>
									<SelectTrigger className="w-full">
										<div className="flex items-center">
											<MapPin className="mr-2 h-4 w-4 text-gray-500" />
											<SelectValue placeholder="Chọn địa điểm" />
										</div>
									</SelectTrigger>
									<SelectContent>
										{DEFAULT_LOCATIONS.map((location) => (
											<SelectItem key={location} value={location}>
												{location === 'Khác' ? 'Địa điểm khác...' : location}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{showCustomLocation && (
								<div className="pt-2">
									<Input
										id="customLocation"
										value={customLocation}
										onChange={handleCustomLocationChange}
										placeholder="Nhập địa điểm tùy chỉnh..."
										className="border-dashed"
										required={selectedLocation === 'Khác'}
									/>
								</div>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="startDate">Ngày bắt đầu *</Label>
							<div className="relative">
								<Input
									id="startDate"
									name="startDate"
									type="datetime-local"
									value={formData.startDate}
									onChange={handleInputChange}
									required
								/>
								<Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="endDate">Ngày kết thúc *</Label>
							<div className="relative">
								<Input
									id="endDate"
									name="endDate"
									type="datetime-local"
									value={formData.endDate}
									onChange={handleInputChange}
									required
								/>
								<Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="maxParticipants">Số lượng tham gia tối đa</Label>
						<Input
							id="maxParticipants"
							name="maxParticipants"
							type="number"
							value={formData.maxParticipants}
							onChange={handleInputChange}
							placeholder="Nhập số lượng tối đa (để trống nếu không giới hạn)"
							min="1"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="file">Hình ảnh sự kiện {!event && '*'}</Label>
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<Input
									id="file"
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="hidden"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() => document.getElementById('file')?.click()}
									className="flex items-center gap-2"
								>
									<Upload className="h-4 w-4" />
									{selectedFile ? 'Thay đổi hình ảnh' : 'Chọn hình ảnh'}
								</Button>
								{selectedFile && <span className="text-sm text-gray-600">{selectedFile.name}</span>}
							</div>

							{previewUrl && (
								<div className="relative inline-block">
									<img
										src={`${previewUrl.startsWith('blob:') ? previewUrl : parseUrl(previewUrl)}`}
										alt="Preview"
										className="w-full max-w-md h-48 object-cover rounded-lg border"
									/>
									<Button
										type="button"
										variant="destructive"
										size="icon"
										className="absolute top-2 right-2 h-8 w-8"
										onClick={removeFile}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Hủy
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Đang xử lý...' : event ? 'Cập nhật' : 'Tạo sự kiện'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
