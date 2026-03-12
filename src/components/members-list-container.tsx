"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import useSWR from "swr";

import { Member } from "@/types/member";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/useDebounce";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { MembersList } from "@/components/members-list";
import { Input } from "@/components/ui/input";

interface MembersResponse {
  members: Member[];
  total: number;
  search: string | null;
}

interface MembersListContainerProps {
  fallbackData?: MembersResponse;
}

export function MembersListContainer({ fallbackData }: MembersListContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search query to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build API URL with debounced search params
  const apiUrl = debouncedSearch
    ? `/api/members?search=${encodeURIComponent(debouncedSearch)}`
    : "/api/members";

  const { data, error } = useSWR<MembersResponse>(apiUrl, fetcher, {
    keepPreviousData: true,
    fallbackData: debouncedSearch ? undefined : fallbackData,
  });

  useTrialGuard(error);

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium mb-2">Failed to load clients</p>
        <p className="text-sm">{error.info?.error || "Please try again later"}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Field */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
          <Input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {debouncedSearch && data && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Found {data.total} {data.total === 1 ? "client" : "clients"}
          </p>
        )}
        {searchQuery !== debouncedSearch && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">Searching...</p>
        )}
      </div>

      {/* Loading State */}
      {!data ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm">Loading clients...</p>
        </div>
      ) : (
        <MembersList members={data.members} searchQuery={debouncedSearch} />
      )}
    </div>
  );
}
