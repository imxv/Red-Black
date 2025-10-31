"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ImageFile = {
  id: string;
  url: string;
  file?: File;
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
        });
      } catch (error) {
        console.error('Failed to read file:', error);
        alert(`读取 ${file.name} 失败`);
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
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
    onChange(images.filter((img) => img.id !== id));
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
                src={image.url}
                alt="上传的图片"
                className="h-full w-full object-cover"
              />

              {/* 删除按钮 */}
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute right-2 top-2 rounded-full bg-slate-900/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-slate-900/80 group-hover:opacity-100"
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
