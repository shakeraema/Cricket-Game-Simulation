/**
 * Custom hook for match history fetching with SWR
 */
import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch match history");
  }

  return res.json();
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
