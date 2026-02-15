import Link from "next/link";
import { Calendar, CheckCircle, Clock, DollarSign, XCircle } from "lucide-react";

import { EventType } from "@/types/event-type";
import { buildRoute } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EventTypeCardProps {
  eventType: EventType;
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  return (
    <Link href={buildRoute.eventType(eventType.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Color indicator */}
            <div
              className="shrink-0 w-1 h-full rounded-full"
              style={{ backgroundColor: eventType.color }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                    {eventType.name}
                  </h3>
                  {eventType.category && (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: eventType.category.color }}
                      />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {eventType.category.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2">
                  {eventType.isActive ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {eventType.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                  {eventType.description}
                </p>
              )}

              {/* Details */}
              <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{eventType.duration} min</span>
                </div>

                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {eventType.price.toFixed(2)} {eventType.currency}
                  </span>
                </div>

                {eventType.isBookable && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Online booking</span>
                  </div>
                )}

                {eventType.requiresApproval && (
                  <Badge variant="outline" className="text-xs">
                    Requires approval
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
