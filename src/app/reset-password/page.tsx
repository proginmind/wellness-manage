import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { ResetPasswordForm } from "./reset-password-form";

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center text-zinc-600 dark:text-zinc-400">Loading...</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
