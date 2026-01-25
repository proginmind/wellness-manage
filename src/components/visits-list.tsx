import { VisitCard } from "@/components/visit-card";
import { Visit } from "@/types/visit";
import { Calendar, Search } from "lucide-react";
import { Member } from "@/types/member";

interface VisitsListProps {
  visits: {
    visit: Visit;
    member: Member;
  }[];
  searchQuery: string;
}

export function VisitsList({ visits, searchQuery }: VisitsListProps) {
  // Display members list or empty state
  if (visits.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {visits.map((visitData) => (
          <VisitCard key={visitData.visit.id} visit={visitData.visit} member={visitData.member} />
        ))}
      </div>
    );
  }

  // Empty state - different messages for search vs no visits
  return (
    <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
      {searchQuery ? (
        // No results for search query
        <>
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No visits found</p>
          <p className="text-sm">
            Try adjusting your search to find what you&apos;re looking for
          </p>
        </>
      ) : (
        // No visits at all
        <>
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No visits yet</p>
          <p className="text-sm">
            Get started by adding your first visit to the wellness center
          </p>
        </>
      )}
    </div>
  );
}
