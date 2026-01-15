"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { memberFormSchema, type MemberFormValues } from "@/lib/validations/member";

interface MemberFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<MemberFormValues>;
  onSubmit: (data: MemberFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function MemberForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: MemberFormProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: defaultValues || {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      dateJoined: new Date().toISOString().split("T")[0],
      image: "",
    },
  });

  const submitButtonText = mode === "create" 
    ? (isSubmitting ? "Creating..." : "Create Member")
    : (isSubmitting ? "Updating..." : "Update Member");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Information</CardTitle>
        <CardDescription>
          All fields marked with * are required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Member's date of birth
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Joined */}
            <FormField
              control={form.control}
              name="dateJoined"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Joined *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Date the member joined the wellness center
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Image (Optional) */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image (Optional)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {submitButtonText}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
