/**
 * Custom hook for teams data fetching with SWR
 */
import useSWR from "swr";
import { apiGet } from "@/lib/apiClient";

const fetcher = async (url) => {
  const payload = await apiGet(url);

  if (!payload?.success) {
    throw new Error(payload?.message || "Failed to fetch teams");
  }

  return payload.data;
};

export function useTeams() {
  const { data, error, isLoading } = useSWR("/api/teams", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    teams: data || [],
    isLoading,
    isError: error,
  };
}
