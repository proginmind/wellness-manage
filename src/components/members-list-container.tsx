"use client";

import { useState } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { MembersList } from "@/components/members-list";
import { Member } from "@/types/member";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";

interface MembersResponse {
  members: Member[];
  total: number;
  search: string | null;
}

export function MembersListContainer() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build API URL with debounced search params
  const apiUrl = debouncedSearch
    ? `/api/members?search=${encodeURIComponent(debouncedSearch)}`
    : "/api/members";

  const { data, error, isLoading } = useSWR<MembersResponse>(apiUrl, fetcher, {
    keepPreviousData: true, // Keep showing old data while fetching new data
  });

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium mb-2">Failed to load members</p>
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
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {debouncedSearch && !isLoading && data && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Found {data.total} {data.total === 1 ? "member" : "members"}
          </p>
        )}
        {searchQuery !== debouncedSearch && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Searching...
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm">Loading members...</p>
        </div>
      ) : (
        <MembersList members={data?.members || []} searchQuery={debouncedSearch} />
      )}
    </div>
  );
}
