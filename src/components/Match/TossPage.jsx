"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatch } from "@/hooks/useMatch";
import { apiPost } from "@/lib/apiClient";
import { ROUTES } from "@/constants/routes";
import styles from "./TossPage.module.css";

export default function TossPage({ matchId }) {
  const router = useRouter();
  const { match, isLoading, mutate } = useMatch(matchId);

  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [message, setMessage] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinFace, setCoinFace] = useState("HEADS");

  const teamMap = {
    teamA: match?.teamA,
    teamB: match?.teamB,
  };
  const selectedTeamName = selectedTeam ? teamMap[selectedTeam] : null;

  const runCoinFlip = () => {
    if (!match || actionLoading || isFlipping || selectedTeam) return;

    setIsFlipping(true);
    setSelectedDecision(null);
    setMessage("");

    const winner = Math.random() < 0.5 ? "teamA" : "teamB";
    const face = winner === "teamA" ? "HEADS" : "TAILS";

    setTimeout(() => {
      setCoinFace(face);
      setSelectedTeam(winner);
      setIsFlipping(false);
      setMessage(`🎉 ${teamMap[winner]} won the toss. Choose bat or bowl.`);
    }, 2200);
  };

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
      const data = await apiPost("/api/match/toss", {
        matchId,
        tossWinner: selectedTeam,
        decision: selectedDecision,
      });

      if (!data?.success) {
        setMessage("❌ " + (data?.message || "Failed to record toss"));
        setActionLoading(false);
        return;
      }

      // Optimistic update
      await mutate(data.data.match, false);
      
      // Redirect will be handled by useEffect when match data updates
      setMessage("✅ Toss recorded! Redirecting...");
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setActionLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.stack}>
        <div className={styles.headerCard}>
          <div>
            <p className={styles.kicker}>Match Setup</p>
            <h1 className={styles.title}>Coin Toss Arena</h1>
            <p className={styles.subtitle}>Flip the coin and lock in the innings decision.</p>
          </div>
          <button
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className={styles.backButton}
          >
            Back to Dashboard
          </button>
        </div>

        <div className={styles.card}>
          <h2>Match Info</h2>
          <div className={styles.matchInfoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Match ID</span>
              <span className={styles.infoValue}>{matchId}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Overs</span>
              <span className={styles.infoValue}>{match.oversLimit}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Teams</h2>
          <div className={styles.teamGrid}>
            <div className={`${styles.teamPill} ${selectedTeam === "teamA" ? styles.activeTeam : ""}`}>
              <span className={styles.teamTag}>Team A</span>
              <span>{match.teamA}</span>
            </div>
            <div className={`${styles.teamPill} ${selectedTeam === "teamB" ? styles.activeTeam : ""}`}>
              <span className={styles.teamTag}>Team B</span>
              <span>{match.teamB}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Flip The Coin</h2>
          <div className={styles.coinArea}>
            <div className={`${styles.coin} ${isFlipping ? styles.flipping : ""}`}>
              <div className={styles.coinFace}>{coinFace}</div>
            </div>
            <button
              className={styles.flipButton}
              onClick={runCoinFlip}
              disabled={isFlipping || actionLoading || !!selectedTeam}
            >
              {isFlipping ? "Flipping..." : "Flip Coin"}
            </button>
            {selectedTeamName && !isFlipping && (
              <p className={styles.winnerText}>Toss Winner: {selectedTeamName}</p>
            )}
          </div>
        </div>

        {selectedTeam && (
          <div className={styles.card}>
            <h2>{selectedTeamName} decides to...</h2>
            <div className={styles.decisionGrid}>
              <button
                className={`${styles.decisionButton} ${selectedDecision === "bat" ? styles.selected : ""}`}
                onClick={() => setSelectedDecision("bat")}
                disabled={actionLoading || isFlipping}
              >
                Bat First
              </button>
              <button
                className={`${styles.decisionButton} ${selectedDecision === "bowl" ? styles.selected : ""}`}
                onClick={() => setSelectedDecision("bowl")}
                disabled={actionLoading || isFlipping}
              >
                Bowl First
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`${styles.message} ${message.includes("❌") ? styles.messageError : styles.messageSuccess}`}>
            {message}
          </div>
        )}

        {selectedTeam && selectedDecision && (
          <div className={styles.actionSection}>
            <button
              onClick={handleToss}
              disabled={actionLoading || isFlipping}
              className={styles.submitButton}
            >
              {actionLoading ? "Recording..." : "Confirm Toss Result"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
