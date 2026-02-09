/**
 * Custom hook for match data fetching with SWR
 */
import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
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
