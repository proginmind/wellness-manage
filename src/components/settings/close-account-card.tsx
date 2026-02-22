"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserX } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { buildRoute } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const closeAccountSchema = z
  .object({
    password: z.string().min(1, "Password is required"),
    confirmUnderstood: z.boolean(),
  })
  .refine((data) => data.confirmUnderstood === true, {
    message: "You must confirm to continue",
    path: ["confirmUnderstood"],
  });

type CloseAccountFormData = z.infer<typeof closeAccountSchema>;

const FORM_TITLE = "Close account";
const FORM_DESCRIPTION =
  "You will no longer be able to log in. Your profile and any organization data will remain in the system but will no longer be accessible by you.";

export function CloseAccountCard() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<CloseAccountFormData>({
    resolver: zodResolver(closeAccountSchema),
    defaultValues: {
      password: "",
      confirmUnderstood: false,
    },
  });

  const onSubmit = async (data: CloseAccountFormData) => {
    try {
      const res = await fetch("/api/account/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          json?.error === "Invalid password"
            ? "Current password is incorrect."
            : json?.error === "Password is required"
              ? "Please enter your password."
              : "Failed to close account. Please try again.";
        toast.error("Could not close account", { description: message });
        return;
      }

      toast.success("Account closed", {
        description: "You have been signed out.",
      });
      setOpen(false);
      await supabase.auth.signOut();
      router.push(buildRoute.login());
    } catch {
      toast.error("Could not close account", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Close account</CardTitle>
          <CardDescription>
            Permanently close your account. You will no longer be able to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            <UserX className="h-4 w-4 mr-2" />
            Close my account
          </Button>
        </CardContent>
      </Card>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{FORM_TITLE}</DialogTitle>
              <DialogDescription>{FORM_DESCRIPTION}</DialogDescription>
            </DialogHeader>
            <CloseAccountForm
              form={form}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => setOpen(false)}
              variant="dialog"
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{FORM_TITLE}</DrawerTitle>
              <DrawerDescription>{FORM_DESCRIPTION}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <CloseAccountForm
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                onCancel={() => setOpen(false)}
                variant="drawer"
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

function CloseAccountForm({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  variant,
}: {
  form: ReturnType<typeof useForm<CloseAccountFormData>>;
  onSubmit: (data: CloseAccountFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  variant: "dialog" | "drawer";
}) {
  const footerClass = "gap-3 sm:gap-0";
  const footer = (
    <>
      {variant === "drawer" ? (
        <DrawerClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </DrawerClose>
      ) : (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      )}
      <Button type="submit" variant="destructive" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Close my account
      </Button>
    </>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmUnderstood"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal cursor-pointer">
                  I understand this action cannot be undone.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        {variant === "dialog" ? (
          <DialogFooter className={footerClass}>{footer}</DialogFooter>
        ) : (
          <DrawerFooter className={footerClass}>{footer}</DrawerFooter>
        )}
      </form>
    </Form>
  );
}
