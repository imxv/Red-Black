"use client";

import { type ChangeEvent, type DragEvent, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type ImageFile = {
  id: string;
  url: string; // 本地预览 URL (base64 或远程 URL)
  file?: File;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'failed';
  remoteUrl?: string; // Freeimage.host 返回的远程 URL
  thumbnailUrl?: string; // 缩略图 URL
  error?: string; // 上传失败时的错误信息
};

type ImageUploadProps = {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
};

export function ImageUpload({
  images,
  onChange,
  maxImages = 9,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  // 使用 ref 跟踪最新的 images，避免闭包问题
  const imagesRef = useRef<ImageFile[]>(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const syncImages = (updater: (previous: ImageFile[]) => ImageFile[]) => {
    const nextImages = updater(imagesRef.current);
    imagesRef.current = nextImages;
    onChange(nextImages);
    return nextImages;
  };

  // 上传图片到远程服务器
  const uploadToRemote = async (imageFile: ImageFile) => {
    // 更新状态为上传中
    syncImages((current) =>
      current.map((img) =>
        img.id === imageFile.id
          ? { ...img, uploadStatus: 'uploading' as const, error: undefined }
          : img
      )
    );

    try {
      // 如果有文件对象，直接使用文件；否则使用 base64
      let formData: FormData;
      
      if (imageFile.file) {
        // 使用文件对象上传（更可靠）
        formData = new FormData();
        formData.append('file', imageFile.file);
      } else {
        // 使用 base64 上传
        const base64Data = imageFile.url.split(',')[1] || imageFile.url;
        // 验证 base64 格式
        if (!base64Data || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
          throw new Error('无效的 base64 图片数据');
        }
        formData = new FormData();
        formData.append('source', base64Data);
      }

      // 调用上传 API
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        // 不要手动设置 Content-Type，让浏览器自动添加 FormData 的 boundary
      });

      const data = await response.json();

      // 记录响应以便调试
      if (!response.ok || !data.success) {
        console.error('上传 API 错误响应:', { status: response.status, data });
        throw new Error(data.error || '上传失败');
      }

      console.log('上传成功:', data);

      // 显示成功提示
      showToast('图片上传成功', 'success');

      // 更新状态为成功,并将预览 URL 切换到远程 URL
      const previousImages = imagesRef.current;
      const updatedImages = syncImages((current) =>
        current.map((img) =>
          img.id === imageFile.id
            ? {
                ...img,
                uploadStatus: 'success' as const,
                url: data.url, // 切换到远程 URL 用于预览显示
                remoteUrl: data.url,
                thumbnailUrl: data.thumbnailUrl || data.url,
                error: undefined,
              }
            : img
        )
      );

      console.log('准备更新图片状态，当前图片数量:', previousImages.length, '更新后数量:', updatedImages.length);
      console.log('更新的图片:', updatedImages.find(img => img.id === imageFile.id));
      console.log('远程 URL:', data.url);
    } catch (error) {
      console.error('上传图片失败:', error);

      // 显示错误提示
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      showToast(errorMessage, 'error');

      // 更新状态为失败
      syncImages((current) =>
        current.map((img) =>
          img.id === imageFile.id
            ? {
                ...img,
                uploadStatus: 'failed' as const,
                error: error instanceof Error ? error.message : '上传失败',
              }
            : img
        )
      );
    }
  };

  // 重试上传
  const retryUpload = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      uploadToRemote(image);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} 不是图片文件`);
        continue;
      }

      // 检查文件大小
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        alert(`${file.name} 超过 ${maxSizeMB}MB 大小限制`);
        continue;
      }

      // 检查总数量
      if (images.length + newImages.length >= maxImages) {
        alert(`最多只能上传 ${maxImages} 张图片`);
        break;
      }

      // 读取文件为 base64
      try {
        const url = await readFileAsDataURL(file);
        newImages.push({
          id: `img-${Date.now()}-${i}`,
          url,
          file,
          uploadStatus: 'pending',
        });
      } catch (error) {
        console.error('Failed to read file:', error);
        alert(`读取 ${file.name} 失败`);
      }
    }

    if (newImages.length > 0) {
      syncImages((current) => [...current, ...newImages]);
      
      // 立即触发上传
      newImages.forEach((image) => {
        uploadToRemote(image);
      });
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    // 重置 input 以允许选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    handleFileSelect(event.dataTransfer.files);
  };

  const handleRemoveImage = (id: string) => {
    syncImages((current) => current.filter((img) => img.id !== id));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      {images.length < maxImages && (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            isDragging
              ? "border-sky-400 bg-sky-400/10"
              : "border-border/40 bg-slate-900/[0.02] hover:border-sky-400/50 hover:bg-slate-900/[0.04]"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                点击上传或拖拽图片到这里
              </p>
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG 等格式，单个文件不超过 {maxSizeMB}MB，最多 {maxImages} 张
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览网格 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border/40 bg-slate-900/[0.02]"
            >
              <img
                src={image.remoteUrl || image.url}
                alt="上传的图片"
                className="h-full w-full object-cover"
              />

              {/* 上传状态叠加层 */}
              {image.uploadStatus === 'uploading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent"></div>
                  <p className="mt-2 text-xs text-white">上传中...</p>
                </div>
              )}

              {image.uploadStatus === 'success' && (
                <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {image.uploadStatus === 'failed' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="mt-2 text-xs text-white">{image.error || '上传失败'}</p>
                  <button
                    type="button"
                    onClick={() => retryUpload(image.id)}
                    className="mt-2 rounded bg-white px-3 py-1 text-xs font-medium text-red-900 hover:bg-slate-100"
                  >
                    重试
                  </button>
                </div>
              )}

              {/* 删除按钮 */}
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className={cn(
                  "absolute right-2 top-2 rounded-full bg-slate-900/60 p-1.5 text-white transition-opacity hover:bg-slate-900/80",
                  image.uploadStatus === 'success' ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}
                aria-label="删除图片"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 图片数量提示 */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          已上传 {images.length} / {maxImages} 张图片
        </p>
      )}
    </div>
  );
}
