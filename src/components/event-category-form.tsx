"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  eventCategoryFormSchema,
  type EventCategoryFormValues,
} from "@/lib/validations/event-category";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";

interface EventCategoryFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<EventCategoryFormValues>;
  onSubmit: (data: EventCategoryFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function EventCategoryForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: EventCategoryFormProps) {
  const form = useForm<EventCategoryFormValues>({
    resolver: zodResolver(eventCategoryFormSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      color: "#3B82F6",
      isActive: true,
    },
  });

  const submitButtonText =
    mode === "create"
      ? isSubmitting
        ? "Creating..."
        : "Create Category"
      : isSubmitting
        ? "Updating..."
        : "Update Category";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Information</CardTitle>
        <CardDescription>All fields marked with * are required</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Massage Therapy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of this category..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help organize your services
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color *</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input type="color" className="w-20 h-10" {...field} />
                    </FormControl>
                    <Input
                      type="text"
                      placeholder="#3B82F6"
                      className="flex-1"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                  <FormDescription>Color used for visual identification in the UI</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive categories won&apos;t be available for new event types
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {submitButtonText}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
