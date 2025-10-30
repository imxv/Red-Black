import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

const variantClassMap: Record<BadgeVariant, string> = {
  default:
    "border-2 border-white/60 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur transition-colors",
  secondary:
    "border border-white/40 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80 shadow-sm backdrop-blur transition-colors",
  outline:
    "border border-white/50 bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/90",
  success:
    "border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90",
  warning:
    "border border-gray-500/60 bg-gray-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300",
  destructive:
    "border border-gray-600/60 bg-gray-600/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-full", variantClassMap[variant], className)} {...props} />;
}
