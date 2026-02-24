import currencies from "@/data/currencies.json";

import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  value: number;
  currency: string;
  className?: string;
}

function getCurrencySymbol(currency: string): string | undefined {
  return currencies.find((c) => c.code === currency)?.symbol;
}

export function CurrencyDisplay({ value, currency, className }: CurrencyDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span>{getCurrencySymbol(currency)}</span>
      <span>
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}
      </span>
      <span>{currency}</span>
    </div>
  );
}
