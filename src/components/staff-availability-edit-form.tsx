"use client";

import * as React from "react";
import { CalendarClock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import { fetcher } from "@/lib/fetcher";
import { buildApiRoute } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface StaffAvailabilityEditFormProps {
  profileId: string;
}

async function saveAvailabilityMutation(
  url: string,
  { arg }: { arg: { slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }> } }
) {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slots: arg.slots }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || "Failed to save availability");
  }

  return response.json();
}

export function StaffAvailabilityEditForm({ profileId }: StaffAvailabilityEditFormProps) {
  const { data, isLoading, error } = useSWR<{ slots: Slot[] }>(
    buildApiRoute.profileAvailability(profileId),
    fetcher
  );

  const { trigger: saveTrigger, isMutating: isSaving } = useSWRMutation(
    buildApiRoute.profileAvailability(profileId),
    saveAvailabilityMutation,
    {
      onSuccess: () => {
        toast.success("Availability saved successfully");
        mutate(buildApiRoute.profileAvailability(profileId));
      },
      onError: (err) => {
        toast.error("Failed to save availability", {
          description: err instanceof Error ? err.message : "Please try again",
        });
      },
    }
  );

  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    setIsInitialized(false);
  }, [profileId]);

  React.useEffect(() => {
    if (data?.slots && !isInitialized) {
      setSlots(
        data.slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        }))
      );
      setIsInitialized(true);
    }
  }, [data?.slots, isInitialized]);

  const addSlot = (dayOfWeek: number) => {
    setSlots((prev) => [...prev, { dayOfWeek, startTime: "09:00", endTime: "17:00" }]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: "startTime" | "endTime", value: string) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    await saveTrigger({ slots });
  };

  const slotsByDay = React.useMemo(() => {
    const byDay: Record<number, Array<Slot & { index: number }>> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    slots.forEach((slot, index) => {
      byDay[slot.dayOfWeek].push({ ...slot, index });
    });
    return byDay;
  }, [slots]);

  if (isLoading || !isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Weekly Availability
          </CardTitle>
          <CardDescription>Configure when this team member is available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-md bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-24 rounded-md bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Failed to load availability
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Weekly Availability
        </CardTitle>
        <CardDescription>
          Configure when this team member is available. Add multiple slots per day for split shifts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAY_NAMES.map((dayName, dayOfWeek) => (
          <div key={dayOfWeek} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{dayName}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addSlot(dayOfWeek)}
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add slot
              </Button>
            </div>
            {slotsByDay[dayOfWeek].length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 pl-1">No slots</p>
            ) : (
              <div className="space-y-2">
                {slotsByDay[dayOfWeek].map(({ startTime, endTime, index }) => (
                  <div key={`${dayOfWeek}-${index}`} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                      className="w-28"
                    />
                    <span className="text-zinc-500 dark:text-zinc-400">–</span>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                      className="w-28"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
