import useSWR, { SWRConfiguration } from "swr";

import { Organization } from "@/types/organization";
import { Profile } from "@/types/profile";
import { fetcher } from "@/lib/fetcher";
import { TrialStatus } from "@/lib/trial";

interface User {
  id: string;
  email: string;
  created_at: string;
  organization?: Organization;
  profile?: Profile;
}

interface UserResponse {
  user: User;
  trial: {
    isOnTrial: boolean;
    isExpired: boolean;
    endsAt: string | null;
    daysLeft: number;
  } | null;
}

export function useUser(options?: SWRConfiguration<UserResponse>) {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>("/api/auth/me", fetcher, {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    ...options,
  });

  // Normalize endsAt from string (JSON) to Date
  const trial: TrialStatus | null = data?.trial
    ? {
        isOnTrial: data.trial.isOnTrial,
        isExpired: data.trial.isExpired,
        endsAt: data.trial.endsAt ? new Date(data.trial.endsAt) : null,
        daysLeft: data.trial.daysLeft,
      }
    : null;

  return {
    user: data?.user,
    trial,
    isLoading,
    isError: error,
    mutate,
  };
}
