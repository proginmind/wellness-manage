import { Card, CardContent } from "@/components/ui/card";
import { Member } from "@/types/member";
import { User, Calendar, Clock, Mail } from "lucide-react";

interface MemberCardProps {
  member: Member;
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function MemberCard({ member }: MemberCardProps) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  const age = calculateAge(member.dateOfBirth);
  const memberSince = new Date(member.dateJoined).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {member.image ? (
              <img
                src={member.image}
                alt={fullName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-300">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {fullName}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <Mail className="h-4 w-4" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{age} years old</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Born {new Date(member.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Joined {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
