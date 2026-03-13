import currencies from "@/data/currencies.json";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORTED_CURRENCIES = [...currencies].sort((a, b) => a.name.localeCompare(b.name));

export const VALID_CURRENCY_CODES = new Set(currencies.map((c) => c.code));

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CurrencySelect({ value, onValueChange, disabled, className }: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className ?? "w-full"}>
        <SelectValue placeholder="Select a currency" />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {SORTED_CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.name} · {c.code} ({c.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
