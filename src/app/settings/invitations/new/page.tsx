"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const invitationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

async function sendInvitation(url: string, { arg }: { arg: InvitationFormData }) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send invitation");
  }

  return response.json();
}

export default function NewInvitationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
    },
  });

  const { trigger } = useSWRMutation("/api/invitations", sendInvitation, {
    onSuccess: (data) => {
      toast.success("Invitation sent successfully", {
        description: `Invitation sent to ${data.invitation.email}`,
      });
      router.push("/settings/invitations");
    },
    onError: (error) => {
      toast.error("Failed to send invitation", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: InvitationFormData) => {
    setIsSubmitting(true);
    await trigger(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/settings/invitations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invitations
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Invite Staff Member
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Send an invitation to join your organization
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="staff@example.com"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Invitation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  asChild
                >
                  <Link href="/settings/invitations">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
