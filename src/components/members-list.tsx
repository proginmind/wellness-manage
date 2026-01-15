"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { MemberCard } from "@/components/member-card";
import { Member } from "@/types/member";
import { Search, Users } from "lucide-react";

interface MembersListProps {
  members: Member[];
}

export function MembersList({ members }: MembersListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase().trim();
    return members.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const email = member.email.toLowerCase();
      
      return fullName.includes(query) || email.includes(query);
    });
  }, [members, searchQuery]);

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
        {searchQuery && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Found {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          </p>
        )}
      </div>

      {/* Members List */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? (
            // No results for search query
            <>
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No members found</p>
              <p className="text-sm">
                Try adjusting your search to find what you're looking for
              </p>
            </>
          ) : (
            // No members at all
            <>
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No members yet</p>
              <p className="text-sm">
                Get started by adding your first member to the wellness center
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
