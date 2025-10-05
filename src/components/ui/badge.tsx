import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

const variantClassMap: Record<BadgeVariant, string> = {
  default:
    "border border-accent/40 bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground shadow-sm backdrop-blur transition-colors",
  secondary:
    "border border-border/60 bg-muted/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80 shadow-sm backdrop-blur transition-colors",
  outline:
    "border border-border/70 bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/90",
  success:
    "border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success",
  warning:
    "border border-warning/30 bg-warning/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning",
  destructive:
    "border border-destructive/30 bg-destructive/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-destructive",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-full", variantClassMap[variant], className)} {...props} />;
}
