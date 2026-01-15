import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MembersPage() {
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
              Members
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your wellness center members
            </p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            Add Member
          </Button>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Members List</CardTitle>
            <CardDescription>
              View and manage all wellness center members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-lg font-medium mb-2">No members yet</p>
              <p className="text-sm mb-4">
                Get started by adding your first member
              </p>
              <Button>
                <span className="mr-2">+</span>
                Add Your First Member
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
