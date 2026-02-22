"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const FORM_TITLE = "Change password";
const FORM_DESCRIPTION =
  "Enter your current password and choose a new one. Use at least 6 characters.";

export function ChangePasswordCard() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const supabase = createClient();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        toast.error("Failed to change password", {
          description: "Could not verify your account. Please try again.",
        });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect", {
          description: "Please check your current password and try again.",
        });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        toast.error("Failed to change password", {
          description: updateError.message,
        });
        return;
      }

      toast.success("Password changed", {
        description: "Your password has been updated successfully.",
      });
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Failed to change password", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and account security</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <KeyRound className="h-4 w-4 mr-2" />
            Change password
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
            <ChangePasswordForm
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
              <ChangePasswordForm
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

function ChangePasswordForm({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  variant,
}: {
  form: ReturnType<typeof useForm<ChangePasswordFormData>>;
  onSubmit: (data: ChangePasswordFormData) => Promise<void>;
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Change password
      </Button>
    </>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
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
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
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
