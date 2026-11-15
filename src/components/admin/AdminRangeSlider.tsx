import * as Slider from "@radix-ui/react-slider";

interface AdminRangeSliderProps {
  id?: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}

export function AdminRangeSlider({
  id,
  min,
  max,
  step = 1,
  value,
  onValueChange,
  formatValue = (v) => String(v),
}: AdminRangeSliderProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--text-muted)]">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>
      <Slider.Root
        id={id}
        className="relative flex h-8 w-full touch-none items-center select-none"
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(next) => {
          const lo = Math.min(next[0] ?? min, next[1] ?? max);
          const hi = Math.max(next[0] ?? min, next[1] ?? max);
          onValueChange([lo, hi]);
        }}
        minStepsBetweenThumbs={0}
      >
        <Slider.Track className="relative h-3 grow rounded-full bg-[var(--surface-muted,#EFECE8)]">
          <Slider.Range className="absolute h-full rounded-full bg-[var(--brand-primary,#ff5a00)]" />
        </Slider.Track>
        <Slider.Thumb
          aria-label="Minimum"
          className="block size-5 rounded-full border-2 border-[var(--brand-primary,#ff5a00)] bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary,#ff5a00)] focus-visible:ring-offset-2"
        />
        <Slider.Thumb
          aria-label="Maximum"
          className="block size-5 rounded-full border-2 border-[var(--brand-primary,#ff5a00)] bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary,#ff5a00)] focus-visible:ring-offset-2"
        />
      </Slider.Root>
    </div>
  );
}
