"use client";

import { type FormEvent, useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { addExposure, type ExposureImage } from "@/data/exposures";
import { cn } from "@/lib/utils";

type ImageFile = {
  id: string;
  url: string;
  file?: File;
};

type ExposureFormProps = {
  onSubmitSuccess?: () => void;
};

export function ExposureForm({ onSubmitSuccess }: ExposureFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitter, setSubmitter] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 表单验证
    if (!title.trim()) {
      alert("请输入标题");
      return;
    }

    if (!description.trim()) {
      alert("请输入详细描述");
      return;
    }

    if (!submitter.trim()) {
      alert("请输入您的昵称");
      return;
    }

    if (description.trim().length < 20) {
      alert("描述至少需要 20 个字");
      return;
    }

    setIsSubmitting(true);

    try {
      // 转换图片数据
      const exposureImages: ExposureImage[] = images.map((img) => ({
        id: img.id,
        url: img.url,
      }));

      // 提取首字作为头像
      const avatarFallback = submitter.trim().charAt(0);

      // 添加曝光
      addExposure({
        title: title.trim(),
        description: description.trim(),
        images: exposureImages,
        submitter: submitter.trim(),
        submitterAvatar: avatarFallback,
        tags: [],
      });

      // 重置表单
      setTitle("");
      setDescription("");
      setSubmitter("");
      setImages([]);

      alert("提交成功！感谢您的曝光，帮助更多人避坑。");

      // 调用成功回调
      onSubmitSuccess?.();
    } catch (error) {
      console.error("Failed to submit exposure:", error);
      alert("提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-slate-900/70 p-6 backdrop-blur-lg">
        <h3 className="mb-6 text-lg font-semibold text-foreground">提交曝光信息</h3>

        <div className="space-y-5">
          {/* 昵称 */}
          <div>
            <label htmlFor="submitter" className="mb-2 block text-sm font-medium text-foreground">
              您的昵称 <span className="text-gray-400">*</span>
            </label>
            <input
              id="submitter"
              type="text"
              value={submitter}
              onChange={(e) => setSubmitter(e.target.value)}
              placeholder="输入您的昵称"
              maxLength={20}
              className={cn(
                "w-full rounded-lg border border-border/40 bg-white/[0.02] px-4 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20",
                "transition-colors"
              )}
              required
            />
          </div>

          {/* 标题 */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-foreground">
              标题 <span className="text-gray-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简要描述问题（例如：某某店铺售卖病态动物）"
              maxLength={100}
              className={cn(
                "w-full rounded-lg border border-border/40 bg-white/[0.02] px-4 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20",
                "transition-colors"
              )}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {title.length} / 100
            </p>
          </div>

          {/* 详细描述 */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
              详细描述 <span className="text-gray-400">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述您遇到的问题，包括时间、地点、经过等信息，以帮助其他玩家了解情况（至少 20 字）"
              rows={6}
              maxLength={2000}
              className={cn(
                "w-full rounded-lg border border-border/40 bg-white/[0.02] px-4 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20",
                "transition-colors resize-none"
              )}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {description.length} / 2000
            </p>
          </div>

          {/* 图片上传 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              上传图片证据（可选）
            </label>
            <ImageUpload images={images} onChange={setImages} maxImages={9} maxSizeMB={5} />
            <p className="mt-2 text-xs text-muted-foreground">
              建议上传聊天记录、商品照片等证据图片，以增加可信度
            </p>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            if (confirm("确定要重置表单吗？")) {
              setTitle("");
              setDescription("");
              setSubmitter("");
              setImages([]);
            }
          }}
          className={cn(
            "rounded-lg border border-border/40 bg-white/[0.02] px-6 py-2.5 text-sm font-medium text-foreground",
            "transition-colors hover:bg-white/[0.04]",
            "focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          )}
        >
          重置
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-black",
            "transition-colors hover:bg-gray-200",
            "focus:outline-none focus:ring-2 focus:ring-white/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isSubmitting ? "提交中..." : "提交曝光"}
        </button>
      </div>

      {/* 提示信息 */}
      <div className="rounded-lg border border-gray-500/20 bg-gray-500/10 p-4">
        <div className="flex gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-gray-400"
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
          <div className="flex-1 text-sm text-gray-300">
            <p className="font-medium">温馨提示</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
              <li>请确保提供的信息真实有效，虚假曝光将被删除</li>
              <li>请勿发布涉及人身攻击、恶意诽谤的内容</li>
              <li>建议提供证据图片以增加可信度</li>
              <li>提交的内容将公开展示，请注意保护个人隐私</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
