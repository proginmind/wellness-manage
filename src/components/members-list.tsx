import { MemberCard } from "@/components/member-card";
import { Member } from "@/types/member";
import { Search, Users } from "lucide-react";

interface MembersListProps {
  members: Member[];
  searchQuery: string;
}

export function MembersList({ members, searchQuery }: MembersListProps) {
  // Display members list or empty state
  if (members.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    );
  }

  // Empty state - different messages for search vs no members
  return (
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
  );
}
