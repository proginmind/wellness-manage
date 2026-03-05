export function formatCurrency(
  amount: number,
  currency: string,
  options?: { inCents?: boolean }
): string {
  const value = options?.inCents ? amount / 100 : amount;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
