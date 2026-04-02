"use client";

/**
 * Match Count Widget
 * Fully decoupled from NextAuth
 * Fetches match count via API using Bearer token
 */

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

export default function MatchCountWidget() {
  const [count, setCount] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchCount = async () => {
      try {
        const token = typeof window !== "undefined" && localStorage.getItem("authToken");
        
        if (!token) {
          setCount("0");
          setLoading(false);
          return;
        }

        // Fetch match history to count matches
        const response = await apiGet("/api/match/history", token);
        
        if (response?.success && Array.isArray(response.data)) {
          setCount(response.data.length.toString());
        } else {
          setCount("0");
        }
      } catch (error) {
        console.error("Failed to fetch match count:", error);
        setCount("0");
      } finally {
        setLoading(false);
      }
    };

    fetchMatchCount();
  }, []);

  if (loading) return "...";
  return count;
}
