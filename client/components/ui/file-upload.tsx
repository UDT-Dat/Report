import { FileText, ImageIcon, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from './button';
import { Label } from './label';

export const FileUpload = ({
	label,
	accept,
	multiple = false,
	onFileChange,
	error,
	files,
	onRemoveFile,
	showImagePreview = false,
}: {
	label: string;
	accept: string;
	multiple?: boolean;
	onFileChange: (files: FileList | null) => void;
	error?: string;
	files?: File[];
	onRemoveFile?: (index: number) => void;
	showImagePreview?: boolean;
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onFileChange(e.target.files);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);

		const droppedFiles = e.dataTransfer.files;
		if (droppedFiles.length > 0) {
			onFileChange(droppedFiles);
		}
	};

	const isImageFile = (file: File) => {
		return file.type.startsWith('image/');
	};

	return (
		<div className="space-y-3">
			<Label>{label}</Label>
			<div
				className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
					isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
				}`}
				onClick={handleClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<Upload
					className={`mx-auto h-8 w-8 mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
				/>
				<p className={`text-sm ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
					{isDragOver ? 'Thả file vào đây' : 'Click để chọn file hoặc kéo thả vào đây'}
				</p>
				<p className="text-xs text-gray-400 mt-1">
					{accept === '*/*' ? 'Tất cả định dạng file' : accept.split(',').join(', ')}
				</p>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				onChange={handleFileChange}
				className="hidden"
			/>
			{error && <p className="text-sm text-red-600">{error}</p>}

			{/* Display selected files */}
			{files && files.length > 0 && (
				<div className="space-y-3">
					{Array.from(files).map((file, index) => (
						<div key={index.toString()} className="space-y-2">
							{/* Image Preview */}
							{showImagePreview && isImageFile(file) && (
								<div className="relative group">
									<img
										src={URL.createObjectURL(file)}
										alt={`Preview ${file.name}`}
										className="w-full h-48 object-cover rounded-lg border shadow-sm"
									/>
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
									{onRemoveFile && (
										<Button
											type="button"
											variant="destructive"
											size="sm"
											onClick={() => onRemoveFile(index)}
											className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							)}

							{/* File Info */}
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
								<div className="flex items-center space-x-3">
									{isImageFile(file) ? (
										<ImageIcon className="h-5 w-5 text-blue-500" />
									) : (
										<FileText className="h-5 w-5 text-gray-500" />
									)}
									<div>
										<span className="text-sm font-medium text-gray-700">{file.name}</span>
										<p className="text-xs text-gray-500">
											{(file.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
								{onRemoveFile && !showImagePreview && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => onRemoveFile(index)}
										className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
