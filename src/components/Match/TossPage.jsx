"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatch } from "@/hooks/useMatch";
import { ROUTES } from "@/constants/routes";
import styles from "./TossPage.module.css";

export default function TossPage({ matchId }) {
  const router = useRouter();
  const { match, isLoading, mutate } = useMatch(matchId);

  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [message, setMessage] = useState("");

  // Handle redirects in useEffect
  useEffect(() => {
    if (isLoading) return;
    if (!match) return;

    // If toss already completed, redirect to play
    if (match.toss?.winner && match.toss?.decision) {
      router.push(ROUTES.MATCH_PLAY(matchId));
      return;
    }

    // If no toss data yet, stay on this page
  }, [match, isLoading, matchId, router]);

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>
          <h2>Loading match...</h2>
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className={styles.container}>
        <div className={styles.error}>
          <h2>Match not found</h2>
          <button onClick={() => router.push(ROUTES.DASHBOARD)} className={styles.button}>
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const handleToss = async () => {
    if (!selectedTeam || !selectedDecision || actionLoading) {
      setMessage("❌ Please select a team and decision first");
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/match/toss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          winningTeam: selectedTeam,
          decision: selectedDecision,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage("❌ " + (error.error || "Failed to record toss"));
        setActionLoading(false);
        return;
      }

      const data = await res.json();
      // Optimistic update
      await mutate(data.match, false);
      
      // Redirect will be handled by useEffect when match data updates
      setMessage("✅ Toss recorded! Redirecting...");
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setActionLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>🏏 Coin Toss</h1>
        <button 
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className={styles.backButton}
        >
          ↩ Back
        </button>
      </div>

      {/* Match Info */}
      <div className={styles.matchInfo}>
        <p><strong>Match ID:</strong> {matchId}</p>
      </div>

      {/* Teams Card */}
      <div className={styles.card}>
        <h2>Select Winning Team</h2>
        <div className={styles.teamGrid}>
          {match.team1 && (
            <button
              className={`${styles.teamButton} ${selectedTeam === match.team1 ? styles.selected : ""}`}
              onClick={() => setSelectedTeam(match.team1)}
              disabled={actionLoading}
            >
              {match.team1}
            </button>
          )}
          {match.team2 && (
            <button
              className={`${styles.teamButton} ${selectedTeam === match.team2 ? styles.selected : ""}`}
              onClick={() => setSelectedTeam(match.team2)}
              disabled={actionLoading}
            >
              {match.team2}
            </button>
          )}
        </div>
      </div>

      {/* Decision Card */}
      {selectedTeam && (
        <div className={styles.card}>
          <h2>{selectedTeam} decides to...</h2>
          <div className={styles.decisionGrid}>
            <button
              className={`${styles.decisionButton} ${selectedDecision === "bat" ? styles.selected : ""}`}
              onClick={() => setSelectedDecision("bat")}
              disabled={actionLoading}
            >
              🏏 Bat First
            </button>
            <button
              className={`${styles.decisionButton} ${selectedDecision === "bowl" ? styles.selected : ""}`}
              onClick={() => setSelectedDecision("bowl")}
              disabled={actionLoading}
            >
              🎯 Bowl First
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`${styles.message} ${message.includes("❌") ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      {/* Action Button */}
      {selectedTeam && selectedDecision && (
        <div className={styles.actionSection}>
          <button
            onClick={handleToss}
            disabled={actionLoading}
            className={styles.submitButton}
          >
            {actionLoading ? "Recording..." : "✅ Confirm Toss"}
          </button>
        </div>
      )}
    </main>
  );
}
