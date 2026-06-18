"use client";

import useSWR from "swr";

import { Member } from "@/types/member";
import { Visit } from "@/types/visit";
import { fetcher } from "@/lib/fetcher";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useUser } from "@/hooks/useUser";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { DashboardSkeleton } from "@/components/dashboard/skeletons";
import { VisitsSection } from "@/components/dashboard/visits-section";
import { TrialBanner } from "@/components/trial-banner";

interface DashboardData {
  kpi: {
    memberStats: { total: number; active: number; archived: number };
    upcomingVisitsCount: number;
    monthlyRevenue: number;
    activeStaff: number;
  };
  currency: string;
  upcomingVisits: { visit: Visit; member: Member }[];
  charts: {
    revenueChart: Array<{ name: string; revenue: number }>;
    visitStatus: Array<{ name: string; value: number; fill: string }>;
    revenueByCategory: Array<{ name: string; value: number; fill: string }>;
  };
}

interface DashboardContentProps {
  fallbackData?: DashboardData;
}

export function DashboardContent({ fallbackData }: DashboardContentProps) {
  const { data, error } = useSWR<DashboardData>("/api/dashboard", fetcher, {
    fallbackData,
  });
  const { trial } = useUser();

  useTrialGuard(error);

  if (!data) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {trial && (trial.isOnTrial || trial.isExpired) && <TrialBanner trial={trial} />}

      <KpiSection
        memberStats={data.kpi.memberStats}
        upcomingVisitsCount={data.kpi.upcomingVisitsCount}
        monthlyRevenue={data.kpi.monthlyRevenue}
        activeStaff={data.kpi.activeStaff}
        currency={data.currency}
      />

      <VisitsSection upcomingVisits={data.upcomingVisits} />

      <ChartsSection
        revenueChart={data.charts.revenueChart}
        visitStatus={data.charts.visitStatus}
        revenueByCategory={data.charts.revenueByCategory}
      />
    </div>
  );
}
