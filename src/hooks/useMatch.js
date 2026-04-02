/**
 * Custom hook for match data fetching with SWR
 */
import useSWR from "swr";
import { apiGet } from "@/lib/apiClient";

const fetcher = async (url) => {
  const payload = await apiGet(url);

  if (!payload?.success) {
    const error = new Error("An error occurred while fetching the data.");
    error.info = payload;
    throw error;
  }

  return payload.data;
};

export function useMatch(matchId, options = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    matchId ? `/api/match/${matchId}` : null,
    fetcher,
    {
      refreshInterval: options.refreshInterval || 0,
      revalidateOnFocus: options.revalidateOnFocus !== false,
      revalidateOnReconnect: options.revalidateOnReconnect !== false,
      ...options,
    },
  );

  return {
    match: data,
    isLoading,
    isError: error,
    mutate,
  };
}
