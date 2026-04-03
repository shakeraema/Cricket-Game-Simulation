"use client";

/**
 * Dashboard Page
 * Fully decoupled from server-side logic
 * All data fetched via REST APIs using Bearer token authentication
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import ProfileSection from "@/components/Dashboard/ProfileSection";
import StatsGrid, { StatCard } from "@/components/Dashboard/StatsGrid";
import MatchCountWidget from "@/components/Dashboard/MatchCountWidget";
import MatchHistory from "@/components/Dashboard/MatchHistory";
import { apiGet } from "@/lib/apiClient";
import styles from "./Dashboard.enhanced.module.css";

function decodeJwtPayload(token) {
  try {
    const parts = token.split("."); // JWT format: header.payload.signature
    if (parts.length < 2) return null; // Invalid token format

    // Decode payload (base64url)

    const payload = parts[1] // replace base64url chars with base64 chars and add padding
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    const decoded = atob(payload); //atob decodes base64 to string
    return JSON.parse(decoded); // convert JSON string to object
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Get token from localStorage
        const token = typeof window !== "undefined" && localStorage.getItem("authToken"); 
        
        if (!token) {
          // Redirect to login if no token
          router.push("/login"); // push means navigate without replacing history, allowing back button to work
          return;
        }

        // Decode token payload to render real user details in dashboard.
        const tokenPayload = decodeJwtPayload(token);
        if (!tokenPayload) {
          localStorage.removeItem("authToken");
          setError("Invalid session. Please log in again.");
          setLoading(false);
          router.push("/login");
          return;
        }

        setUser({
          id: tokenPayload.id || tokenPayload.sub || "",
          name: tokenPayload.name || "User", // how name is extracted? 
          email: tokenPayload.email || "",
          role: tokenPayload.role || "user",
        });

        setLoading(false);
      } catch (err) {
        console.error("Auth verification failed:", err);
        setError(err.message);
        setLoading(false);
        router.push("/login");
      }
    };

    verifyAuth(); // run the async auth verification function on component mount
  }, [router]); // router is included in dependency array to avoid warnings, but it doesn't change so it won't cause re-renders

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>Loading dashboard...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorState}>
          {error || "Please log in to continue"}
        </div>
      </div>
    );
  }

  return (
    <main className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>🏏 Cricket Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Profile Section */}
      <ProfileSection user={user} />

      {/* Stats Section */}
      <StatsGrid>
        <StatCard 
          icon="📊" 
          label="Total Matches" 
          value={<MatchCountWidget />} 
        />
       
      </StatsGrid>

      {/* Start New Match */}
      <section className={styles.actionSection}>
        <h2>⚡ Ready to Play?</h2>
        <Link href="/match/new">
          <button className={styles.actionButton}>
            🏏 Start New Match
          </button>
        </Link>
      </section>

      {user?.role === "admin" && (
        <section className={styles.actionSection}>
          <h2>🛠 Admin Actions</h2>
          <Link href="/admin/setup">
            <button className={styles.actionButton}>
              🌱 Seed Teams
            </button>
          </Link>
        </section>
      )}

      {/* Match History */}
      <section className={styles.historySection}>
        <h2>📜 Previous Matches</h2>
        <MatchHistory />
      </section>
    </main>
  );
}
