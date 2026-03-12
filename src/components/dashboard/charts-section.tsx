import { DonutChart } from "@/components/donut-chart";
import { RevenueChart } from "@/components/revenue-chart";

interface ChartsSectionProps {
  revenueChart: Array<{ name: string; revenue: number }>;
  visitStatus: Array<{ name: string; value: number; fill: string }>;
  revenueByCategory: Array<{ name: string; value: number; fill: string }>;
}

export function ChartsSection({
  revenueChart,
  visitStatus,
  revenueByCategory,
}: ChartsSectionProps) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <DonutChart
          data={visitStatus}
          title="Appointment Status"
          description="All appointments breakdown"
          valueFormat="number"
        />
        <DonutChart
          data={revenueByCategory}
          title="Revenue by Category"
          description="Completed appointments"
          valueFormat="currency"
        />
      </div>

      <RevenueChart data={revenueChart} />
    </>
  );
}
