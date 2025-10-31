"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ImageUpload } from "@/components/ui/image-upload";
import { addExposure, type ExposureImage } from "@/data/exposures";
import { cn } from "@/lib/utils";

type ImageFile = {
  id: string;
  url: string; // 本地预览 URL (base64 或远程 URL)
  file?: File;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'failed';
  remoteUrl?: string; // Freeimage.host 返回的远程 URL
  thumbnailUrl?: string; // 缩略图 URL
  error?: string; // 上传失败时的错误信息
};

type ExposureFormProps = {
  onSubmitSuccess?: () => void;
};

// 获取头像 fallback 字符
const getAvatarFallback = (name?: string | null, email?: string | null) => {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "U";
};

export function ExposureForm({ onSubmitSuccess }: ExposureFormProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 检查用户是否已登录
    if (!session?.user) {
      alert("请先登录后再提交曝光信息");
      router.push("/auth/signin");
      return;
    }

    // 表单验证
    if (!title.trim()) {
      alert("请输入标题");
      return;
    }

    if (!description.trim()) {
      alert("请输入详细描述");
      return;
    }

    if (description.trim().length < 15) {
      alert("描述至少需要 15 个字");
      return;
    }

    // 检查图片上传状态
    const uploadingImages = images.filter(img => img.uploadStatus === 'uploading');
    if (uploadingImages.length > 0) {
      alert(`还有 ${uploadingImages.length} 张图片正在上传中，请稍候或移除这些图片后再提交`);
      return;
    }

    const failedImages = images.filter(img => img.uploadStatus === 'failed');
    if (failedImages.length > 0) {
      const confirmSubmit = confirm(
        `有 ${failedImages.length} 张图片上传失败，是否移除失败的图片并继续提交？\n\n点击"确定"将移除失败图片并提交，点击"取消"可重试上传。`
      );
      if (!confirmSubmit) {
        return;
      }
      // 移除上传失败的图片
      setImages(images.filter(img => img.uploadStatus !== 'failed'));
    }

    setIsSubmitting(true);

    try {
      // 转换图片数据 - 只使用上传成功的图片
      const exposureImages: ExposureImage[] = images
        .filter(img => img.uploadStatus === 'success' && img.remoteUrl)
        .map((img) => ({
          id: img.id,
          url: img.remoteUrl!, // 使用远程 URL
        }));

      // 获取用户信息
      const submitterName = session.user.name || session.user.email || "匿名用户";
      const avatarFallback = getAvatarFallback(session.user.name, session.user.email);

      // 添加曝光
      addExposure({
        title: title.trim(),
        description: description.trim(),
        images: exposureImages,
        submitter: submitterName,
        submitterAvatar: avatarFallback,
        tags: [],
      });

      // 重置表单
      setTitle("");
      setDescription("");
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
      <div className="rounded-2xl border border-border/40 bg-white p-6 backdrop-blur-lg">
        <h3 className="mb-6 text-lg font-semibold text-foreground">提交曝光信息</h3>

        {/* 用户登录状态提示 */}
        {isPending ? (
          <div className="mb-5 rounded-lg border border-border/40 bg-slate-50 p-4">
            <p className="text-sm text-muted-foreground">加载用户信息中...</p>
          </div>
        ) : !session?.user ? (
          <div className="mb-5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-amber-700"
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
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">需要登录</p>
                <p className="mt-1 text-xs text-amber-800">
                  提交曝光信息需要先登录账号。
                  <button
                    type="button"
                    onClick={() => router.push("/auth/signin")}
                    className="ml-1 underline hover:text-amber-900"
                  >
                    立即登录
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-lg border border-sky-500/20 bg-sky-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-200 text-sm font-semibold text-sky-900">
                {getAvatarFallback(session.user.name, session.user.email)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-sky-900">
                  将以 <span className="font-semibold">{session.user.name || session.user.email}</span> 的身份提交
                </p>
                <p className="text-xs text-sky-800">您的曝光信息将关联到此账号</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-foreground">
              标题 <span className="text-slate-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简要描述问题（例如：某某店铺售卖病态动物）"
              maxLength={100}
              className={cn(
                "w-full rounded-lg border border-border/40 bg-slate-900/[0.02] px-4 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-slate-400/50 focus:outline-none focus:ring-2 focus:ring-slate-400/20",
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
              详细描述 <span className="text-slate-400">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述您遇到的问题，包括时间、地点、经过等信息，以帮助其他玩家了解情况（至少 15 字）"
              rows={6}
              maxLength={2000}
              className={cn(
                "w-full rounded-lg border border-border/40 bg-slate-900/[0.02] px-4 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-slate-400/50 focus:outline-none focus:ring-2 focus:ring-slate-400/20",
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
              setImages([]);
            }
          }}
            className={cn(
              "rounded-lg border border-border/40 bg-slate-900/[0.02] px-6 py-2.5 text-sm font-medium text-foreground",
              "transition-colors hover:bg-slate-900/[0.04]",
              "focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            )}
        >
          重置
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !session?.user}
            className={cn(
              "rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white",
              "transition-colors hover:bg-slate-800",
              "focus:outline-none focus:ring-2 focus:ring-slate-900/20",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
        >
          {isSubmitting ? "提交中..." : "提交曝光"}
        </button>
      </div>

      {/* 提示信息 */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-amber-700"
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
          <div className="flex-1 text-sm text-amber-900">
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