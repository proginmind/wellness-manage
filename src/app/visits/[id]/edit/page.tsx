"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

import type { EventTypesListResponse, MembersListResponse, StaffListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { applySchemaErrors } from "@/lib/form-errors";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import {
  getVisitEditUiSchema,
  visitFormBaseSchema,
  type VisitBookingMode,
  type VisitEditFormValues,
} from "@/lib/validations/visit";
import { confirmVisitSubmit } from "@/lib/visit-form-submit";
import { useUser } from "@/hooks/useUser";
import { AppLayout } from "@/components/app-layout";
import { MemberCombobox } from "@/components/member-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VisitBookingModeToggle } from "@/components/visit-booking-mode-toggle";
import { ConfirmationSummary } from "@/components/visit-confirmation-summary";
import { VisitGuidedDatetimeFields } from "@/components/visit-guided-datetime-fields";
import { VisitManualDatetimeFields } from "@/components/visit-manual-datetime-fields";
import { getStaffAvatarUrl, getStaffDisplayName } from "@/components/visit-staff-select";

const STEPS = [
  { id: 0, label: "Client" },
  { id: 1, label: "Service & time" },
  { id: 2, label: "Confirm" },
];

interface VisitApiResponse {
  visit: {
    id: string;
    memberId: string;
    eventTypeId: string;
    staffId?: string;
    date: string;
    time: string;
    notes?: string;
    status: string;
    eventTypeName: string;
    eventTypePrice: number;
    eventTypeCurrency?: string;
  };
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
  };
}

export default function EditVisitPage() {
  const params = useParams();
  const router = useRouter();
  const visitId = params.id as string;

  const [step, setStep] = useState(0);
  const [bookingMode, setBookingMode] = useState<VisitBookingMode>("guided");

  const {
    data: visitData,
    isLoading: visitLoading,
    error: visitError,
  } = useSWR<VisitApiResponse>(`/api/visits/${visitId}`, fetcher);
  const { data: membersData } = useSWR<MembersListResponse>("/api/members", fetcher);
  const { data: eventTypesData } = useSWR<EventTypesListResponse>("/api/event-types", fetcher);
  const { data: staffData } = useSWR<StaffListResponse>(
    `${buildApiRoute.profiles()}?include=eventTypes`,
    fetcher
  );
  const { user } = useUser();
  const orgCurrency = user?.organization?.currency ?? "USD";

  const members = membersData?.members ?? [];
  const eventTypes = eventTypesData?.eventTypes?.filter((et) => et.isActive) ?? [];

  const initialTime = useMemo(() => {
    if (!visitData?.visit.time) return "";
    const raw = visitData.visit.time;
    if (raw.includes("T")) {
      return format(new Date(raw), "HH:mm");
    }
    return raw.slice(0, 5);
  }, [visitData?.visit.time]);

  const originalDateTime = useMemo(() => {
    if (!visitData) return undefined;
    return {
      date: visitData.visit.date ? format(new Date(visitData.visit.date), "yyyy-MM-dd") : "",
      time: initialTime,
    };
  }, [visitData, initialTime]);

  const form = useForm<VisitEditFormValues>({
    resolver: zodResolver(visitFormBaseSchema),
    values: visitData
      ? {
          memberId: visitData.visit.memberId,
          eventTypeId: visitData.visit.eventTypeId,
          staffId: visitData.visit.staffId,
          date: visitData.visit.date ? format(new Date(visitData.visit.date), "yyyy-MM-dd") : "",
          time: initialTime,
          notes: visitData.visit.notes ?? "",
        }
      : undefined,
  });

  const watchMemberId = form.watch("memberId");
  const watchEventTypeId = form.watch("eventTypeId");
  const selectedStaffId = form.watch("staffId");

  useEffect(() => {
    if (visitData?.visit.status === "cancelled") {
      router.replace(buildRoute.visit(visitId));
    }
  }, [visitData?.visit.status, visitId, router]);

  const handleBookingModeChange = (mode: VisitBookingMode) => {
    setBookingMode(mode);
    if (mode === "guided") {
      form.setValue("date", "");
      form.setValue("time", "");
      form.setValue("staffId", undefined);
    }
    form.clearErrors(["date", "time", "staffId"]);
  };

  const handleNext = async () => {
    if (step === 0) {
      const ok = await form.trigger("memberId");
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      const schema = getVisitEditUiSchema(bookingMode, originalDateTime);
      const parsed = schema.safeParse(form.getValues());
      if (!parsed.success) {
        applySchemaErrors(form, parsed.error.issues);
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const onSubmit = async (data: VisitEditFormValues) => {
    try {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, bookingMode }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update visit");
      }
      await mutate("/api/visits");
      await mutate(`/api/visits/${visitId}`);
      toast.success("Visit updated successfully");
      router.push(buildRoute.visit(visitId));
    } catch (e) {
      toast.error("Failed to update visit", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

  const handleConfirmSubmit = () =>
    confirmVisitSubmit({
      form,
      schema: getVisitEditUiSchema(bookingMode, originalDateTime),
      onInvalid: () => setStep(1),
      onValid: onSubmit,
    });

  const selectedMember = members.find((m) => m.id === form.watch("memberId"));
  const selectedEventType = eventTypes.find((et) => et.id === form.watch("eventTypeId"));
  const staffList = staffData?.staff as
    | Array<{
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        avatarImage?: string;
      }>
    | undefined;
  const staffName = getStaffDisplayName(staffList, selectedStaffId);
  const staffAvatarUrl = getStaffAvatarUrl(staffList, selectedStaffId);

  if (visitLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
            <div className="h-64 bg-zinc-200 dark:bg-zinc-700 rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (visitError || !visitData) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
          <Link
            href={buildRoute.visits()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Visits
          </Link>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-zinc-500 dark:text-zinc-400">
                {visitError ? "Failed to load visit" : "Visit not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <Link
            href={buildRoute.visit(visitId)}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Visit
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Edit appointment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Update the appointment details
          </p>
        </div>

        <nav aria-label="Progress" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center">
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    step >= s.id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="mx-2 text-muted-foreground" aria-hidden>
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {step === 0 && (
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <MemberCombobox
                        value={field.value}
                        onChange={field.onChange}
                        members={members}
                        isLoading={!membersData}
                        placeholder="Select or search member..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 1 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="eventTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("date", "");
                          form.setValue("time", "");
                          form.setValue("staffId", undefined);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map((et) => (
                            <SelectItem key={et.id} value={et.id}>
                              {et.name} – {et.duration} min – {orgCurrency}{" "}
                              {typeof et.price === "number" ? et.price.toFixed(2) : et.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchEventTypeId && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Booking method</p>
                      <VisitBookingModeToggle
                        value={bookingMode}
                        onChange={handleBookingModeChange}
                      />
                    </div>

                    {bookingMode === "guided" ? (
                      <VisitGuidedDatetimeFields
                        form={form}
                        eventTypeId={watchEventTypeId}
                        memberId={watchMemberId || undefined}
                        excludeVisitId={visitId}
                      />
                    ) : (
                      <VisitManualDatetimeFields form={form} eventTypeId={watchEventTypeId} />
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Add any notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <ConfirmationSummary
                memberName={
                  selectedMember
                    ? `${selectedMember.firstName} ${selectedMember.lastName}`
                    : visitData.member
                      ? `${visitData.member.firstName} ${visitData.member.lastName}`
                      : "—"
                }
                memberId={form.watch("memberId") || undefined}
                memberEmail={selectedMember?.email ?? visitData.member?.email}
                memberImage={selectedMember?.image ?? visitData.member?.image}
                serviceName={selectedEventType?.name ?? visitData.visit.eventTypeName}
                eventTypeId={form.watch("eventTypeId") || undefined}
                price={selectedEventType?.price ?? visitData.visit.eventTypePrice}
                currency={orgCurrency}
                date={form.watch("date")}
                time={form.watch("time")}
                staffName={staffName ?? "—"}
                staffId={selectedStaffId}
                staffAvatarUrl={staffAvatarUrl}
                notes={form.watch("notes")}
              />
            )}

            <div className="flex gap-3 pt-4">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" asChild>
                  <Link href={buildRoute.visit(visitId)}>Cancel</Link>
                </Button>
              )}
              <div className="flex-1" />
              {step < 2 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={form.formState.isSubmitting}
                  onClick={handleConfirmSubmit}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
