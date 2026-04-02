"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatch } from "@/hooks/useMatch";
import { apiPost } from "@/lib/apiClient";
import { ROUTES } from "@/constants/routes";
import styles from "./PlayMatch.module.css";

export default function PlayMatch({ matchId }) {
  const router = useRouter();
  const { match, isLoading, mutate } = useMatch(matchId, {
    refreshInterval: 0, // Disable auto-polling, we'll update manually
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [message, setMessage] = useState("");

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (isLoading) return;

    if (!match) {
      return; // Show error state instead of redirecting
    }

    // Check toss completion
    if (!match.toss?.winner || !match.toss?.decision) {
      router.push(ROUTES.MATCH_VIEW(matchId));
      return;
    }
  }, [match, isLoading, matchId, router]);

  // Update popup state in useEffect when innings completes
  // Must be defined before early returns to maintain hook order
  useEffect(() => {
    if (!match || !match.innings || match.innings.length === 0) return;
    
    const currentInnings = match.innings[match.currentInnings];
    if (currentInnings?.completed && !showEndPopup) {
      setShowEndPopup(true);
    }
  }, [match, showEndPopup]);

  // Check if match data is ready
  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>
          <p>Loading match...</p>
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className={styles.container}>
        <div className={styles.error}>
          <p>Match not found</p>
          <button onClick={() => router.push(ROUTES.DASHBOARD)} className={styles.button}>
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // Check if innings is initialized
  if (!match.innings || match.innings.length === 0) {
    return (
      <main className={styles.container}>
        <div className={styles.initializing}>
          <h2>Initializing First Innings…</h2>
          <p>Click Play Ball to start the match</p>
        </div>
      </main>
    );
  }

  const inningsNumber = match.currentInnings + 1;
  const currentInnings = match.innings[match.currentInnings];
  const isFirstInnings = match.currentInnings === 0;
  const isSecondInnings = match.currentInnings === 1;

  // Play Ball Handler with optimistic update
  const playBall = async () => {
    if (!match || actionLoading || currentInnings.completed || match.status !== "IN_PROGRESS") {
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      const data = await apiPost("/api/match/play-ball", { matchId });

      if (!data?.success) {
        let errorMsg = "Cannot play ball";
        errorMsg = data?.message || errorMsg;
        setMessage("❌ " + errorMsg);
        setActionLoading(false);
        return;
      }

      const updatedMatch = data.data.match;
      
      // Optimistic UI update - update local state immediately
      await mutate(updatedMatch, false);

      // Show the last ball result
      const ballLog = updatedMatch.innings[updatedMatch.currentInnings].ballLog;
      if (ballLog.length > 0) {
        const lastBall = ballLog[ballLog.length - 1];
        if (lastBall.outcome === "W") {
          setMessage("💥 Wicket! Player out!");
        } else {
          setMessage(`⚾ ${lastBall.runs} runs`);
        }
      }

      // Check if innings completed
      if (updatedMatch.innings[updatedMatch.currentInnings].completed) {
        setShowEndPopup(true);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Pause Match Handler
  const pauseMatch = async () => {
    try {
      const data = await apiPost("/api/match/pause", { matchId });

      if (data?.success) {
        await mutate(); // Revalidate match data
      }
    } catch (error) {
      console.error("Pause error:", error);
    }
  };

  // Resume Match Handler
  const resumeMatch = async () => {
    try {
      const data = await apiPost("/api/match/resume", { matchId });

      if (data?.success) {
        await mutate(); // Revalidate match data
      }
    } catch (error) {
      console.error("Resume error:", error);
    }
  };

  // Start Second Innings Handler
  const startSecondInnings = async () => {
    try {
      const data = await apiPost(`/api/match/${matchId}/start-innings`, {});

      if (!data?.success) {
        alert("Failed to start second innings");
        return;
      }

      setShowEndPopup(false);
      await mutate(); // Revalidate match data
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <main className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>🏏 Innings {inningsNumber}</h1>
        <button 
          onClick={() => router.push(ROUTES.DASHBOARD)} 
          className={styles.dashboardButton}
        >
          ↩ Dashboard
        </button>
      </div>

      {/* Score Card */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreItem}>
          <p className={styles.scoreLabel}>Batting Team</p>
          <p className={styles.scoreValue}>{currentInnings.battingTeam}</p>
        </div>
        <div className={styles.scoreItem}>
          <p className={styles.scoreLabel}>Runs</p>
          <p className={styles.scoreValue}>{currentInnings.runs}</p>
        </div>
        <div className={styles.scoreItem}>
          <p className={styles.scoreLabel}>Wickets</p>
          <p className={styles.scoreValue}>{currentInnings.wickets}</p>
        </div>
        <div className={styles.scoreItem}>
          <p className={styles.scoreLabel}>Overs</p>
          <p className={styles.scoreValue}>{currentInnings.overs}.{currentInnings.balls}</p>
        </div>
      </div>

      {/* Target (2nd Innings) */}
      {isSecondInnings && currentInnings.target && (
        <div className={styles.targetCard}>
          <p>
            🎯 Target: <strong>{currentInnings.target}</strong>
            {currentInnings.runs >= currentInnings.target && (
              <span className={styles.targetAchieved}>✅ Target Achieved!</span>
            )}
          </p>
        </div>
      )}

      {/* Current Players */}
      <div className={styles.playersGrid}>
        <div className={styles.playerCard}>
          <p className={styles.playerRole}>STRIKER</p>
          <p className={styles.playerName}>{currentInnings.striker}</p>
          {currentInnings.batsmen && currentInnings.batsmen.find(b => b.name === currentInnings.striker) && (
            <p className={styles.playerStats}>
              {currentInnings.batsmen.find(b => b.name === currentInnings.striker).runs} runs • 
              {currentInnings.batsmen.find(b => b.name === currentInnings.striker).balls} balls
            </p>
          )}
        </div>

        <div className={styles.playerCard}>
          <p className={styles.playerRole}>BOWLER</p>
          <p className={styles.playerName}>{currentInnings.currentBowler}</p>
          {currentInnings.bowlers && currentInnings.bowlers.find(b => b.name === currentInnings.currentBowler) && (
            <p className={styles.playerStats}>
              {currentInnings.bowlers.find(b => b.name === currentInnings.currentBowler).runs} runs • 
              {currentInnings.bowlers.find(b => b.name === currentInnings.currentBowler).wickets} wickets
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={styles.messageBox}>
          {message}
        </div>
      )}

      {/* Controls */}
      {!currentInnings.completed && (
        <div className={styles.controls}>
          <button
            onClick={playBall}
            disabled={actionLoading || match.status !== "IN_PROGRESS"}
            className={`${styles.button} ${styles.playButton}`}
          >
            {actionLoading ? "Playing..." : "▶ Play Ball"}
          </button>

          {match.status === "IN_PROGRESS" && (
            <button
              onClick={pauseMatch}
              className={`${styles.button} ${styles.pauseButton}`}
            >
              ⏸ Pause
            </button>
          )}

          {match.status === "PAUSED" && (
            <button
              onClick={resumeMatch}
              className={`${styles.button} ${styles.resumeButton}`}
            >
              ▶ Resume
            </button>
          )}
        </div>
      )}

      {/* End of Innings Popup */}
      {showEndPopup && currentInnings.completed && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            {isFirstInnings && (
              <>
                <h2>🏁 First Innings Completed!</h2>
                <div className={styles.popupInfo}>
                  <p className={styles.popupScore}>
                    <strong>{currentInnings.battingTeam}</strong> scored <strong>{currentInnings.runs}</strong> runs
                  </p>
                  <p className={styles.popupDetails}>
                    Wickets: {currentInnings.wickets} | Overs: {currentInnings.overs}.{currentInnings.balls}
                  </p>
                </div>
                <p className={styles.targetInfo}>
                  🎯 Target for {match.innings[1]?.battingTeam}: <strong>{currentInnings.runs + 1}</strong>
                </p>
                <button
                  onClick={startSecondInnings}
                  className={`${styles.button} ${styles.continueButton}`}
                >
                  ▶ Start Second Innings
                </button>
              </>
            )}

            {isSecondInnings && (
              <>
                <h2>🏆 Match Completed!</h2>
                {match.result && (
                  <div className={styles.popupInfo}>
                    <p className={styles.winnerText}>
                      <strong>{match.result.winner}</strong> wins the match!
                    </p>
                    <p className={styles.marginText}>
                      Won by <strong>{match.result.winMargin} {match.result.winType}</strong>
                    </p>
                  </div>
                )}
                <button
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                  className={`${styles.button} ${styles.continueButton}`}
                >
                  ↩ Back to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Scorecard */}
      <div className={styles.scorecard}>
        <h3>📊 Batsmen Scorecard</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Runs</th>
              <th>Balls</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentInnings.batsmen && currentInnings.batsmen.length > 0 ? (
              currentInnings.batsmen.map((batsman, idx) => (
                <tr key={idx}>
                  <td>{batsman.name}</td>
                  <td>{batsman.runs}</td>
                  <td>{batsman.balls}</td>
                  <td>{batsman.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  No batsmen data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
