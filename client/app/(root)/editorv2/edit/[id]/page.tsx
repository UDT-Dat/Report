"use client"

import type React from 'react';
import {
  use,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FileText,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { RichTextEditor } from '@/components/editor';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { parseImageUrl } from '@/lib/parseImageUrl';
import {
  updateContent,
  updateSrcImage,
} from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for post validation
const createPostSchema = z.object({
  title: z.string()
    .min(1, { message: "Tiêu đề không được để trống" })
    .min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" })
    .max(200, { message: "Tiêu đề không được quá 200 ký tự" }),
  content: z.string()
    .min(1, { message: "Nội dung không được để trống" })
    .min(10, { message: "Nội dung phải có ít nhất 10 ký tự" }),
  bannerImage: z.instanceof(File, { message: "Vui lòng chọn ảnh banner" })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Ảnh banner không được quá 5MB"
    })
    .refine((file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type), {
      message: "Ảnh banner phải là file JPG, PNG hoặc GIF"
    }),
  attachments: z.array(z.instanceof(File)).optional(),
});

const editPostSchema = z.object({
  title: z.string()
    .min(1, { message: "Tiêu đề không được để trống" })
    .min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" })
    .max(200, { message: "Tiêu đề không được quá 200 ký tự" }),
  content: z.string()
    .min(1, { message: "Nội dung không được để trống" })
    .min(10, { message: "Nội dung phải có ít nhất 10 ký tự" }),
  bannerImage: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Ảnh banner không được quá 5MB"
    })
    .refine((file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type), {
      message: "Ảnh banner phải là file JPG, PNG hoặc GIF"
    })
    .optional(),
  attachments: z.array(z.instanceof(File)).optional(),
});

type EditPostFormData = z.infer<typeof editPostSchema>;

// Component for displaying existing banner image
const ExistingBannerImage = ({
  imagePath,
  onRemove
}: {
  imagePath: string;
  onRemove: () => void;
}) => {
  const imageUrl = parseImageUrl(imagePath);

  return (
    <div className="space-y-3">
      <Label>Ảnh banner hiện tại</Label>
      <div className="relative group">
        <img
          src={imageUrl}
          alt="Current banner"
          className="w-full h-48 object-cover rounded-lg border shadow-sm"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Component for displaying existing attachments
const ExistingAttachments = ({
  attachments,
  onRemove
}: {
  attachments: ExistingAttachment[];
  onRemove: (id: string) => void;
}) => {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-3">
      <Label>Tệp đính kèm hiện tại</Label>
      {attachments.map((attachment) => (
        <div key={attachment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            {attachment.fileType.startsWith('image/') ? (
              <ImageIcon className="h-5 w-5 text-blue-500" />
            ) : (
              <FileText className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <span className="text-sm font-medium text-gray-700">{attachment.originalname}</span>
              <p className="text-xs text-gray-500">
                {(attachment.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(attachment._id)}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

// File upload component
const FileUpload = ({
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
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
          }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`mx-auto h-8 w-8 mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
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
            <div key={index} className="space-y-2">
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

// Types for existing post data
type ExistingAttachment = {
  _id: string;
  originalname: string;
  url: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
};

type ExistingPost = {
  _id: string;
  title: string;
  content: string;
  bannerImage: string;
  attachments: ExistingAttachment[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
};

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isEditMode = id !== "new";

  const { user, tokens } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingPost, setExistingPost] = useState<ExistingPost | null>(null);
  const [existingBannerImage, setExistingBannerImage] = useState<string | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<EditPostFormData>({
    resolver: zodResolver(isEditMode ? editPostSchema : createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      attachments: [],
      bannerImage: undefined,
    },
  });

  const handleSubmit = async (data: EditPostFormData) => {
    if (!user || !tokens) {
      const message = isEditMode ? "Bạn cần đăng nhập để chỉnh sửa bài viết" : "Bạn cần đăng nhập để tạo bài viết";
      toast.error(message, {
        duration: 2000,
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', await updateContent(data.content, {
      accessToken: tokens.accessToken!,
      refreshToken: tokens.refreshToken!,
    }));

    // Add banner image if new one is selected
    if (data.bannerImage) {
      formData.append('bannerImage', data.bannerImage);
    }

    // Add new attachments if any
    if (attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    // Add removed attachment IDs for edit mode
    if (isEditMode && removedAttachmentIds.length > 0) {
      removedAttachmentIds.forEach((id) => {
        formData.append('removeAttachments', id);
      });
    }


    const response = await fetchApi(`/posts/${id}`, {
      method: 'PUT',
      body: formData,
    }, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    setIsSubmitting(false);

    if (response.status === 200) {
      const successMessage = isEditMode ? "Bài viết đã được cập nhật thành công!" : "Bài viết đã được tạo thành công!";
      toast.success(successMessage, {
        duration: 2000,
      });
      router.push(`/posts/${response.result._id}`);
    } else {
      const errorMessage = isEditMode ? "Có lỗi xảy ra khi cập nhật bài viết" : "Có lỗi xảy ra khi tạo bài viết";
      toast.error(response.result.message || errorMessage, {
        duration: 2000,
      });
    }
  };


  const handleCancel = () => {
    router.back();
  };

  const handleBannerImageChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      form.setValue('bannerImage', files[0], { shouldValidate: true });
      // Clear existing banner image when new one is selected
      if (existingBannerImage) {
        setExistingBannerImage(null);
      }
    }
  };

  const handleAttachmentsChange = (files: FileList | null) => {
    if (files) {
      const newAttachments = Array.from(files);
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeBannerImage = () => {
    form.setValue('bannerImage', undefined, { shouldValidate: true });
    setExistingBannerImage(null);
  };

  const removeExistingAttachment = (attachmentId: string) => {
    setExistingAttachments(prev => prev.filter(att => att._id !== attachmentId));
    setRemovedAttachmentIds(prev => [...prev, attachmentId]);
  };

  const bannerImage = form.watch('bannerImage');

  useEffect(() => {
    async function fetchPost() {
      if (isEditMode) {
        const response = await fetchApi(`/posts/${id}`, {
          method: 'GET',
        }, {
          accessToken: tokens?.accessToken,
          refreshToken: tokens?.refreshToken,
        });

        if (response.status === 200) {
          const postData: ExistingPost = response.result;
          setExistingPost(postData);
          // Set form data
          form.reset({
            title: postData.title,
            content: postData.content,
            bannerImage: undefined, // Don't set existing banner as File
            attachments: [], // Don't set existing attachments as Files
          });

          // Set existing banner image and attachments separately
          setExistingBannerImage(postData.bannerImage);
          setExistingAttachments(postData.attachments || []);
        } else {
          setIsNotFound(true);
        }
      }
    }

    fetchPost().then(() => {
      setIsLoading(false);
    });
  }, [id, isEditMode, tokens]);
  if (isLoading) {
    return <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </div>
  }
  if (isNotFound && !isLoading) {
    return <div className="container mx-auto px-4 py-6 h-full">
      <div className="mb-6 flex justify-center items-center h-full">
        <h1 className="text-2xl font-bold">Bài viết không tồn tại</h1>
      </div>
    </div>
  }
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
        </h1>
        {isEditMode && existingPost && (
          <p className="text-sm text-gray-500 mt-1 dark:text-white">
            Bài viết: {existingPost.title}
          </p>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Tiêu đề bài viết"
                    className="text-xl font-medium"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="bannerImage"
            render={({ field }) => (
              <FormItem>
                {/* Show existing banner image if available and no new one is selected */}
                {existingBannerImage && !bannerImage && (
                  <ExistingBannerImage
                    imagePath={existingBannerImage}
                    onRemove={removeBannerImage}
                  />
                )}

                {/* Show file upload for new banner image */}
                <FileUpload
                  label={existingBannerImage && !bannerImage ? "Thay đổi ảnh banner" : "Ảnh banner *"}
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onFileChange={handleBannerImageChange}
                  error={form.formState.errors.bannerImage?.message}
                  files={bannerImage ? [bannerImage] : undefined}
                  onRemoveFile={removeBannerImage}
                  showImagePreview={true}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            {/* Show existing attachments */}
            {existingAttachments.length > 0 && (
              <ExistingAttachments
                attachments={existingAttachments}
                onRemove={removeExistingAttachment}
              />
            )}

            {/* File upload for new attachments */}
            <FileUpload
              label={existingAttachments.length > 0 ? "Thêm tệp đính kèm mới" : "Tệp đính kèm"}
              accept="*/*"
              multiple
              onFileChange={handleAttachmentsChange}
              files={attachments}
              onRemoveFile={removeAttachment}
            />
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor
                    value={updateSrcImage(field.value)}
                    onChange={field.onChange}
                    placeholder="Nội dung bài viết..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-4">
            <Button
              type="submit"
              className="bg-[#00B0F4] hover:bg-[#00A0E4]"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isEditMode ? "Đang cập nhật..." : "Đang đăng...")
                : (isEditMode ? "Cập nhật bài viết" : "Đăng bài")
              }
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="ml-auto text-gray-500"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
