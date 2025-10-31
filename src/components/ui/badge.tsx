import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

const variantClassMap: Record<BadgeVariant, string> = {
  default:
    "border-2 border-slate-400/60 bg-slate-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-sm backdrop-blur transition-colors",
  secondary:
    "border border-slate-300/40 bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80 shadow-sm backdrop-blur transition-colors",
  outline:
    "border border-slate-400/50 bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/90",
  success:
    "border border-green-400/40 bg-green-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-900/90",
  warning:
    "border border-amber-500/60 bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900",
  destructive:
    "border border-red-600/60 bg-red-600/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-900",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-full", variantClassMap[variant], className)} {...props} />;
}
