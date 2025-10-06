"use client";

import { useId, useMemo } from "react";

import { cn } from "@/lib/utils";

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

const HALF_STEP = 0.5;

export function StarRatingInput({ value, onChange, max = 5 }: StarRatingInputProps) {
  const groupName = useId();
  const steps = useMemo(
    () =>
      Array.from({ length: max * 2 }, (_, index) =>
        Number(((index + 1) * HALF_STEP).toFixed(1)),
      ),
    [max],
  );

  return (
    <div className="rating rating-lg rating-half">
      <input
        type="radio"
        name={groupName}
        className="rating-hidden"
        value={0}
        aria-label="清除评分"
        checked={value === 0}
        onChange={() => onChange(0)}
      />
      {steps.map((step, index) => {
        const isFirstHalf = index % 2 === 0;

        return (
          <input
            key={step}
            type="radio"
            name={groupName}
            value={step}
            aria-label={`${step} 星`}
            checked={value === step}
            onChange={() => onChange(step)}
            className={cn(
              "mask mask-star-2 bg-amber-400/80 transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
              isFirstHalf ? "mask-half-1" : "mask-half-2",
            )}
          />
        );
      })}
    </div>
  );
}
