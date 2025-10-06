const TOTAL_STARS = 5;

function StarIcon({ className, filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.98a1 1 0 00.95.69h4.19c.969 0 1.371 1.24.588 1.81l-3.392 2.466a1 1 0 00-.364 1.118l1.287 3.98c.3.922-.755 1.688-1.538 1.118l-3.392-2.466a1 1 0 00-1.176 0l-3.392 2.466c-.783.57-1.838-.196-1.539-1.118l1.287-3.98a1 1 0 00-.364-1.118L2.94 9.407c-.783-.57-.38-1.81.588-1.81h4.19a1 1 0 00.95-.69l1.286-3.98z" />
    </svg>
  );
}

export function RatingDisplay({ rating }: { rating: number }) {
  const getFillForStar = (index: number) => {
    const remainder = rating - index;

    if (remainder >= 1) return 100;
    if (remainder <= 0) return 0;

    return remainder * 100;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-4xl font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: TOTAL_STARS }).map((_, index) => {
            const fill = getFillForStar(index);

            return (
              <div key={index} className="relative h-4 w-4">
                <StarIcon className="h-full w-full text-slate-700/60" />
                {fill > 0 && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fill}%` }}
                  >
                    <StarIcon className="h-full w-full text-amber-400" filled />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">综合评分</p>
    </div>
  );
}
