"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWR from "swr";

import { EventCategoriesListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import { eventTypeFormSchema, type EventTypeFormValues } from "@/lib/validations/event-type";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface EventTypeFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<EventTypeFormValues>;
  onSubmit: (data: EventTypeFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function EventTypeForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: EventTypeFormProps) {
  // Fetch categories
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useSWR<EventCategoriesListResponse>("/api/event-categories?is_active=true", fetcher);

  const categories = categoriesResponse?.eventCategories;

  const form = useForm<EventTypeFormValues>({
    resolver: zodResolver(eventTypeFormSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      color: "#3B82F6",
      categoryId: undefined,
      duration: 60,
      bufferBefore: 0,
      bufferAfter: 0,
      price: 0,
      isActive: true,
      isBookable: true,
      requiresApproval: false,
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 24,
    },
  });

  const submitButtonText =
    mode === "create"
      ? isSubmitting
        ? "Creating..."
        : "Create Event Type"
      : isSubmitting
        ? "Updating..."
        : "Update Event Type";

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>General details about this service</CardDescription>
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
                      <Input placeholder="Swedish Massage" {...field} />
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
                        placeholder="Describe this service..."
                        rows={4}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Optional description for clients</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) => field.onChange(value || undefined)}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Organize services by category.{" "}
                      {categories && categories.length === 0 && (
                        <Link
                          href={buildRoute.eventCategoriesNew()}
                          className="text-blue-600 hover:underline"
                        >
                          Create a category
                        </Link>
                      )}
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
                    <div className="flex gap-3 items-center">
                      <FormControl>
                        <Input type="color" className="w-20 h-10" {...field} />
                      </FormControl>
                      <FormControl>
                        <Input
                          placeholder="#3B82F6"
                          className="font-mono"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Auto-add # if not present
                            field.onChange(value.startsWith("#") ? value : `#${value}`);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormDescription>Used for calendar and visual identification</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Time Configuration</CardTitle>
          <CardDescription>Duration and buffer times (in minutes)</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Buffer Before */}
                <FormField
                  control={form.control}
                  name="bufferBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep Time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">Minutes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">Minutes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buffer After */}
                <FormField
                  control={form.control}
                  name="bufferAfter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cleanup Time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">Minutes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total time slot:{" "}
                <span className="font-medium">
                  {form.watch("bufferBefore") + form.watch("duration") + form.watch("bufferAfter")}{" "}
                  minutes
                </span>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>
            Set the price for this service (currency is set at organization level)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Settings</CardTitle>
          <CardDescription>Configure availability and booking rules</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Availability Checkboxes */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Make this event type available for scheduling
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBookable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Online Booking</FormLabel>
                        <FormDescription>Allow clients to book this service online</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Requires Approval</FormLabel>
                        <FormDescription>
                          Bookings must be manually approved before confirmation
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Booking Limits */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="minAdvanceBookingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Notice *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Hours before service</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAdvanceBookingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Advance Booking</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>Days (leave empty for no limit)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
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
    </div>
  );
}
