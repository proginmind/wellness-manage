import {
  getRevenueByCategoryDistribution,
  getRevenueChartData,
  getVisitStatusDistribution,
} from "@/lib/supabase/queries";
import { DonutChart } from "@/components/donut-chart";
import { RevenueChart } from "@/components/revenue-chart";

export async function ChartsSection() {
  const [chartData, visitStatusData, revenueByCategoryData] = await Promise.all([
    getRevenueChartData(),
    getVisitStatusDistribution(),
    getRevenueByCategoryDistribution(),
  ]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <DonutChart
          data={visitStatusData}
          title="Visit Status Distribution"
          description="All visits breakdown"
          valueFormat="number"
        />
        <DonutChart
          data={revenueByCategoryData}
          title="Revenue by Category"
          description="Completed visits"
          valueFormat="currency"
        />
      </div>

      <RevenueChart data={chartData} />
    </>
  );
}
