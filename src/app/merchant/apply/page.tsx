"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function MerchantApplyPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const res = await fetch("/api/merchants/me", { cache: "no-store" });
      const data = await res.json();
      if (!ignore) setIsMerchant(!!data?.isMerchant);
    }
    load();
    return () => { ignore = true; };
  }, []);

  const displayName = useMemo(() => {
    if (!session?.user) return "";
    return session.user.name || (session.user.email ? session.user.email.split("@")[0] : "");
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/merchants/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location, description, highlights }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "提交失败");
      // 成功后返回首页，首页会合并数据库商家列表
      router.push("/");
      router.refresh();
    } catch (err) {
      alert((err as Error).message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending) return <div className="mx-auto max-w-3xl p-6 text-foreground">加载中...</div>;
  if (!session?.user)
    return (
      <div className="mx-auto max-w-3xl p-6 text-foreground">
        请先登录。<a href="/auth/signin" className="text-sky-400 hover:underline">前往登录</a>
      </div>
    );
  if (isMerchant)
    return (
      <div className="mx-auto max-w-3xl p-6 text-foreground">
        您已是商家，无需重复申请。
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl p-6 text-foreground">
      <h1 className="mb-6 text-2xl font-semibold">申请成为商家</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border/40 bg-white p-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">商家名称（只读，等于用户名）</label>
            <input
              type="text"
              value={displayName}
              disabled
              className="w-full rounded-lg border border-border/40 bg-slate-900/[0.04] px-4 py-2.5 text-sm text-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">暂不支持修改名称，将使用您的当前用户名作为商家名称</p>
          </div>
          <div>
            <label className="mb-2 block text-sm text-foreground">主营业务/类目</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="如：宠物用品、两栖爬宠、咖啡馆..."
              className="w-full rounded-lg border border-border/40 bg-slate-900/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-foreground">所在城市/位置</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="如：上海 · 徐汇"
              className="w-full rounded-lg border border-border/40 bg-slate-900/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-foreground">商家介绍</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要介绍商家特色、服务、优势..."
              rows={5}
              className="w-full rounded-lg border border-border/40 bg-slate-900/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-foreground">亮点标签</label>
            <input
              type="text"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="逗号分隔，如：价格透明, 售后及时, 环境整洁"
              className="w-full rounded-lg border border-border/40 bg-slate-900/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">最多 8 个标签，将展示在商家卡片上</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {submitting ? "提交中..." : "提交申请"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-border/40 bg-slate-900/[0.02] px-5 py-2 text-sm text-foreground hover:bg-slate-900/[0.06]"
          >
            返回
          </button>
        </div>
      </form>
    </div>
  );
}

