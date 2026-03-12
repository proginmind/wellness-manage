import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function FieldRow({ labelWidth = "w-24" }: { labelWidth?: string }) {
  return (
    <div>
      <Skeleton className={`h-3 ${labelWidth} mb-2`} />
      <Skeleton className="h-5 w-48" />
    </div>
  );
}

export default function OrganizationSettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your organization settings</p>
        </div>
        <Skeleton className="h-9 w-20" />
      </div>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow labelWidth="w-16" />
          <FieldRow labelWidth="w-20" />
          <FieldRow labelWidth="w-24" />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow labelWidth="w-14" />
          <FieldRow labelWidth="w-20" />
          <FieldRow labelWidth="w-16" />
          <FieldRow labelWidth="w-24" />
        </CardContent>
      </Card>
    </div>
  );
}
