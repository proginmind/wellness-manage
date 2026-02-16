"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWR from "swr";

import { EventTypesListResponse, MembersListResponse, StaffListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute } from "@/lib/routes";
import { visitFormSchema, VisitFormValues } from "@/lib/validations/visit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface VisitFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<VisitFormValues>;
  onSubmit: (data: VisitFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function VisitForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: VisitFormProps) {
  // Fetch members
  const { data: membersResponse, isLoading: membersLoading } = useSWR<MembersListResponse>(
    "/api/members",
    fetcher
  );

  // Fetch event types (active only)
  const { data: eventTypesResponse, isLoading: eventTypesLoading } = useSWR<EventTypesListResponse>(
    "/api/event-types",
    fetcher
  );

  // Fetch staff members (only "staff" role, not "owner")
  const { data: staffResponse, isLoading: staffLoading } = useSWR<StaffListResponse>(
    `${buildApiRoute.profiles()}?role=staff`,
    fetcher
  );

  const members = membersResponse?.members;
  const eventTypes = eventTypesResponse?.eventTypes;
  const staff = staffResponse?.staff;

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: defaultValues || {
      memberId: "",
      eventTypeId: "",
      staffId: undefined,
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      notes: "",
    },
  });

  const submitButtonText =
    mode === "create"
      ? isSubmitting
        ? "Creating..."
        : "Create Visit"
      : isSubmitting
        ? "Updating..."
        : "Update Visit";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit Information</CardTitle>
        <CardDescription>All fields marked with * are required</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Member */}
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={membersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visit Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visit Time */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Time *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type (Service) */}
            <FormField
              control={form.control}
              name="eventTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={eventTypesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes
                          ?.filter((et) => et.isActive)
                          .map((eventType) => (
                            <SelectItem key={eventType.id} value={eventType.id}>
                              {eventType.name} - {eventType.duration} min - $
                              {eventType.price.toFixed(2)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Service duration and price will be applied from the selected service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Staff Member */}
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member (Optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value || undefined)}
                      disabled={staffLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            staffLoading
                              ? "Loading staff..."
                              : !staff || staff.length === 0
                                ? "No staff members available"
                                : "Not assigned - Select a staff member"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {staff?.map((staffMember) => {
                          const displayName = staffMember.email.split("@")[0];
                          return (
                            <SelectItem key={staffMember.id} value={staffMember.id}>
                              {displayName} ({staffMember.role})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {!staff || staff.length === 0
                      ? "No staff members found. Add staff members in Team settings to assign them to visits."
                      : "Assign a staff member to this visit"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visit Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter visit notes" {...field} />
                  </FormControl>
                  <FormMessage />
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
