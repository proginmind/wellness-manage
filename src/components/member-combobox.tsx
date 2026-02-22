"use client";

import * as React from "react";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

import type { Member } from "@/types/member";
import { buildApiRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { MemberFormValues } from "@/lib/validations/member";
import { MemberForm } from "@/components/member-form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MemberComboboxProps {
  value: string;
  onChange: (memberId: string) => void;
  members: Member[] | undefined;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MemberCombobox({
  value,
  onChange,
  members = [],
  isLoading,
  placeholder = "Select or search member...",
  className,
  disabled,
}: MemberComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSubmitting, setCreateSubmitting] = React.useState(false);

  const selectedMember = members.find((m) => m.id === value);
  const displayValue = selectedMember
    ? `${selectedMember.firstName} ${selectedMember.lastName}`
    : placeholder;

  async function handleCreateMember(data: MemberFormValues) {
    setCreateSubmitting(true);
    try {
      const response = await fetch(buildApiRoute.members(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth,
          dateJoined: data.dateJoined,
          image: data.image || "",
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create member");
      }
      const result = await response.json();
      mutate((key) => typeof key === "string" && key.startsWith("/api/members"));
      toast.success("Member created", {
        description: `${result.member.firstName} ${result.member.lastName} has been added.`,
      });
      setCreateOpen(false);
      onChange(result.member.id);
      setOpen(false);
    } catch (e) {
      toast.error("Failed to create member", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setCreateSubmitting(false);
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              "w-full justify-between font-normal min-h-[2.25rem]",
              !value && "text-muted-foreground",
              className
            )}
          >
            {displayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search by name or email..." />
            <CommandList>
              <CommandEmpty>No member found.</CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={`${member.firstName} ${member.lastName} ${member.email}`}
                    onSelect={() => {
                      onChange(member.id);
                      setOpen(false);
                    }}
                    className="min-h-[44px]"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === member.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start">
                      <span>
                        {member.firstName} {member.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateOpen(true);
                  }}
                  className="min-h-[44px] border-t"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create new member
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create new member</DialogTitle>
          </DialogHeader>
          <MemberForm
            mode="create"
            onSubmit={handleCreateMember}
            isSubmitting={createSubmitting}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
