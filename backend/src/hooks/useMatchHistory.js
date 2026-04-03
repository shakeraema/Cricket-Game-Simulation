/**
 * Custom hook for match history fetching with SWR
 */
import useSWR from "swr";
import { apiGet } from "@/lib/apiClient";

const fetcher = async (url) => {
  const payload = await apiGet(url);

  if (!payload?.success) {
    throw new Error(payload?.message || "Failed to fetch match history");
  }

  return payload.data;
};

export function useMatchHistory() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/match/history",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    matches: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
