/**
 * Custom hook for teams data fetching with SWR
 */
import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }

  return res.json();
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
