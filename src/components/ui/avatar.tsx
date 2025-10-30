import Image from "next/image";
import type { ComponentProps, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white/10 text-sm font-semibold uppercase text-slate-900",
        className,
      )}
      {...props}
    />
  );
}

type AvatarImageProps = Omit<ComponentProps<typeof Image>, "width" | "height"> & {
  width?: number;
  height?: number;
};

export function AvatarImage({ className, alt, width = 48, height = 48, ...props }: AvatarImageProps) {
  return (
    <Image
      className={cn("h-full w-full object-cover", className)}
      alt={alt ?? ""}
      width={width}
      height={height}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-500 to-gray-700 text-base font-bold text-white",
        className,
      )}
      {...props}
    />
  );
}
