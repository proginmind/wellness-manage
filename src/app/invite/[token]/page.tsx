import { Suspense } from "react";
import { InviteContent } from "@/components/invite-content";
import { Loader2 } from "lucide-react";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        }
      >
        <InviteContent token={token} />
      </Suspense>
    </div>
  );
}
