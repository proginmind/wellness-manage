import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { MembersList } from "@/components/members-list";
import { mockMembers } from "@/lib/mock-data";

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
              {mockMembers.length} {mockMembers.length === 1 ? 'member' : 'members'} registered
            </p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            Add Member
          </Button>
        </div>

        {/* Members List with Search */}
        <MembersList members={mockMembers} />
      </div>
    </AppLayout>
  );
}
