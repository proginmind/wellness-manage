import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { VisitsListContainer } from "@/components/visits-list-container";
import Link from "next/link";

export default async function VisitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Visits
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your wellness center visits
            </p>
          </div>
          <Button asChild>
            <Link href="/visits/new">
              <span className="mr-2">+</span>
              Add Visit
            </Link>
          </Button>
        </div>

        {/* Members List with Search */}
        <VisitsListContainer />
      </div>
    </AppLayout>
  );
}
