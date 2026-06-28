import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventTypeNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Event Type Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The event type you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to view it.
          </p>
          <Button asChild className="w-full">
            <Link href={buildRoute.eventTypes()}>Back to Event Types</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
