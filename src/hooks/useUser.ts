import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserResponse {
  user: User;
}

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>(
    "/api/auth/me",
    fetcher,
    {
      dedupingInterval: 60000, // Don't refetch for 1 minute
      revalidateOnFocus: false, // Don't revalidate on window focus for auth
    }
  );

  return {
    user: data?.user,
    isLoading,
    isError: error,
    mutate,
  };
}
