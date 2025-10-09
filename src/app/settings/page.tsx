"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMerchant, setIsMerchant] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/merchants/me", { cache: "no-store" });
        const data = await res.json();
        if (!ignore) setIsMerchant(!!data?.isMerchant);
      } finally {
        if (!ignore) setLoadingStatus(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  if (isPending) {
    return <div className="mx-auto max-w-3xl p-6 text-foreground">加载中...</div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-foreground">
        请先登录。
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 text-foreground">
      <Link
        href="/"
        className="group mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/60 hover:text-sky-100"
      >
        <BackIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        返回首页
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">个人设置</h1>

      <div className="mb-8 rounded-xl border border-border/40 bg-slate-900/70 p-5">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">用户名</div>
          <div className="text-base">{session.user.name || session.user.email}</div>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-slate-900/70 p-5">
        <h2 className="mb-3 text-lg font-medium">商家相关</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          用户可申请成为商家。申请提交后立即生效（暂不需要审核）。
        </p>
        <button
          disabled={loadingStatus || isMerchant}
          onClick={() => router.push("/merchant/apply")}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            isMerchant
              ? "cursor-not-allowed bg-white/[0.06] text-muted-foreground"
              : "bg-sky-500 text-white hover:bg-sky-600"
          }`}
        >
          {isMerchant ? "您已是商家" : "申请成为商家"}
        </button>
      </div>
    </div>
  );
}

