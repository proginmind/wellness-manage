"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Visit } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

import type { EventTypesListResponse, MembersListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import type { VisitFormValues } from "@/lib/validations/visit";
import { visitFormSchema } from "@/lib/validations/visit";
import { useUser } from "@/hooks/useUser";
import { AppLayout } from "@/components/app-layout";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { MemberCombobox } from "@/components/member-combobox";
import { TimeSlotPicker, type TimeSlotOption } from "@/components/time-slot-picker";
import { Button } from "@/components/ui/button";
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
import { ConfirmationSummary } from "@/components/visit-confirmation-summary";

const STEPS = [
  { id: 0, label: "Client" },
  { id: 1, label: "Service & time" },
  { id: 2, label: "Confirm" },
];

export default function NewVisitPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState<TimeSlotOption[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const { data: membersData } = useSWR<MembersListResponse>("/api/members", fetcher);
  const { data: eventTypesData } = useSWR<EventTypesListResponse>("/api/event-types", fetcher);
  const { user } = useUser();
  const orgCurrency = user?.organization?.currency ?? "USD";

  const members = membersData?.members ?? [];
  const eventTypes = eventTypesData?.eventTypes?.filter((et) => et.isActive) ?? [];

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      memberId: "",
      eventTypeId: "",
      staffId: undefined,
      date: "",
      time: "",
      notes: "",
    },
  });

  const watchMemberId = form.watch("memberId");
  const watchEventTypeId = form.watch("eventTypeId");
  const watchDate = form.watch("date");

  // Fetch slots when date and eventTypeId are set
  useEffect(() => {
    if (!watchEventTypeId || !watchDate) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    const params = new URLSearchParams({
      eventTypeId: watchEventTypeId,
      date: watchDate,
      ...(watchMemberId ? { memberId: watchMemberId } : {}),
    });
    fetch(`/api/availability/slots?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { slots: TimeSlotOption[] }) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [watchEventTypeId, watchDate, watchMemberId]);

  const visibleSlots = useMemo(() => {
    if (!watchDate || !slots.length) return slots;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (watchDate !== todayStr) return slots;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return slots.filter((slot) => {
      const [h, m] = slot.time.split(":").map(Number);
      const slotMins = (h ?? 0) * 60 + (m ?? 0);
      return slotMins > nowMins;
    });
  }, [slots, watchDate]);

  const handleNext = async () => {
    if (step === 0) {
      const ok = await form.trigger("memberId");
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await form.trigger(["eventTypeId", "date", "time"]);
      if (ok) setStep(2);
      return;
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const onSubmit = async (data: VisitFormValues) => {
    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create visit");
      }
      mutate("/api/visits");
      mutate((key) => typeof key === "string" && key.startsWith("/api/visits"));
      const result = await response.json();
      const visit = result.visit as Visit;
      toast.success("Visit created", {
        description: (
          <div className="space-y-2">
            <p>The appointment has been scheduled.</p>
            <p>
              <Link href={buildRoute.visit(visit.id)}>View appointment</Link>
            </p>
          </div>
        ),
      });
      router.push(buildRoute.visits());
    } catch (e) {
      toast.error("Failed to create visit", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

  const selectedMember = members.find((m) => m.id === form.watch("memberId"));
  const selectedEventType = eventTypes.find((et) => et.id === form.watch("eventTypeId"));
  const selectedStaffId = form.watch("staffId");
  const slotsForStaffName = slots.flatMap((s) => s.staff);
  const selectedStaff = slotsForStaffName.find((s) => s.id === selectedStaffId);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <Link
            href={buildRoute.visits()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            New Appointment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Book an appointment in three steps
          </p>
        </div>

        {/* Stepper */}
        <nav aria-label="Progress" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center">
                <span
                  className={`
                    text-xs sm:text-sm font-medium
                    ${step >= s.id ? "text-primary" : "text-muted-foreground"}
                  `}
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
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <AvailabilityCalendar
                              eventTypeId={watchEventTypeId}
                              selected={
                                field.value ? new Date(field.value + "T12:00:00") : undefined
                              }
                              onSelect={(d) => {
                                field.onChange(d ? format(d, "yyyy-MM-dd") : "");
                                form.setValue("time", "");
                                form.setValue("staffId", undefined);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchDate && (
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time & staff</FormLabel>
                            <FormControl>
                              <TimeSlotPicker
                                slots={visibleSlots}
                                selectedTime={field.value || undefined}
                                selectedStaffId={form.watch("staffId")}
                                onSelect={(time, staffId) => {
                                  field.onChange(time);
                                  form.setValue("staffId", staffId);
                                }}
                                isLoading={slotsLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                  selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : "—"
                }
                memberId={form.watch("memberId") || undefined}
                memberEmail={selectedMember?.email}
                memberImage={selectedMember?.image}
                serviceName={selectedEventType?.name ?? "—"}
                eventTypeId={form.watch("eventTypeId") || undefined}
                price={selectedEventType?.price}
                currency={orgCurrency}
                date={form.watch("date")}
                time={form.watch("time")}
                staffName={selectedStaff?.displayName ?? "—"}
                staffId={selectedStaffId}
                staffAvatarUrl={selectedStaff?.avatarUrl}
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
                  <Link href={buildRoute.visits()}>Cancel</Link>
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
                  onClick={() => form.handleSubmit(onSubmit)()}
                >
                  {form.formState.isSubmitting ? "Creating..." : "Create appointment"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
