"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./MatchView.module.css";

export default function MatchViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch(`/api/match/${id}`);

        if (!res.ok) {
          router.push("/dashboard");
          return;
        }

        const data = await res.json();

        // Only allow viewing completed matches
        if (data.status !== "COMPLETED") {
          router.push(`/match/${id}/play`);
          return;
        }

        setMatch(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching match:", err);
        router.push("/dashboard");
      }
    }

    fetchMatch();
  }, [id, router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading match...</div>
      </div>
    );
  }

  if (!match) {
    return null;
  }

  const firstInnings = match.innings[0];
  const secondInnings = match.innings[1];
  const result = match.result;

  const formatInningsScore = (innings) => {
    if (!innings) return "N/A";
    return `${innings.runs}/${innings.wickets} (${innings.overs}.${innings.balls})`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Back Button */}
        <Link href="/dashboard">
          <button className={styles.backButton}>
            ↩ Back to Dashboard
          </button>
        </Link>

        {/* Match Header */}
        <div className={styles.matchHeader}>
          <h1>{match.teamA} vs {match.teamB}</h1>
          <p className={styles.matchInfo}>Match ID: {match._id}</p>
          <p className={styles.matchInfo}>Format: {match.oversLimit} Overs</p>
        </div>

        {/* Match Result */}
        {result && (
          <div className={styles.resultCard}>
            <h2>🏆 MATCH RESULT</h2>
            <p className={styles.resultWinner}>{result.winner} Won</p>
            <p className={styles.resultMargin}>
              {result.winType === "runs" 
                ? `by ${result.winMargin || 0} runs` 
                : `by ${result.winMargin || 0} wickets`}
            </p>
          </div>
        )}

        {/* Toss Information */}
        {match.toss && (
          <div className={styles.infoCard}>
            <h3>🪙 Toss Information</h3>
            <p><strong>Toss Winner:</strong> {match.toss.winner}</p>
            <p><strong>Decision:</strong> {match.toss.decision === "bat" ? "Bat First" : "Bowl First"}</p>
          </div>
        )}

        {/* First Innings */}
        {firstInnings && (
          <div className={styles.inningsCard}>
            <h3>🏏 First Innings</h3>
            <div className={styles.inningsGrid}>
            <div>
              <p><strong>Batting Team:</strong> {firstInnings.battingTeam}</p>
              <p><strong>Score:</strong> {formatInningsScore(firstInnings)}</p>
            </div>
            <div>
              <p><strong>Bowling Team:</strong> {firstInnings.bowlingTeam}</p>
              <p><strong>Overs Limit:</strong> {firstInnings.oversLimit}</p>
            </div>
          </div>

            {/* Batsmen Stats */}
            {firstInnings.batsmen && firstInnings.batsmen.length > 0 && (
              <div>
                <h4>Batting Stats:</h4>
                <table className={styles.statsTable}>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th style={{ textAlign: "center" }}>Runs</th>
                      <th style={{ textAlign: "center" }}>Balls</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firstInnings.batsmen.map((batsman, idx) => (
                      batsman.status !== "yet_to_bat" && (
                        <tr key={idx}>
                          <td>{batsman.name}</td>
                          <td style={{ textAlign: "center" }}>{batsman.runs}</td>
                          <td style={{ textAlign: "center" }}>{batsman.balls}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className={`${styles.statusBadge} ${batsman.status === "out" ? styles.statusOut : styles.statusBatting}`}>
                              {batsman.status === "out" ? "OUT" : "BATTING"}
                            </span>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bowlers Stats */}
            {firstInnings.bowlers && firstInnings.bowlers.length > 0 && (
              <div>
                <h4>Bowling Stats:</h4>
                <table className={styles.statsTable}>
                  <thead>
                    <tr>
                      <th>Bowler</th>
                      <th style={{ textAlign: "center" }}>Overs</th>
                      <th style={{ textAlign: "center" }}>Runs</th>
                      <th style={{ textAlign: "center" }}>Wickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firstInnings.bowlers.map((bowler, idx) => (
                      (bowler.overs > 0 || bowler.wickets > 0) && (
                        <tr key={idx}>
                          <td>{bowler.name}</td>
                          <td style={{ textAlign: "center" }}>{bowler.overs}</td>
                          <td style={{ textAlign: "center" }}>{bowler.runs}</td>
                          <td style={{ textAlign: "center" }}>{bowler.wickets}</td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Second Innings */}
        {secondInnings && (
          <div className={styles.inningsCard}>
            <h3>🏏 Second Innings</h3>
            <div className={styles.inningsGrid}>
            <div>
              <p><strong>Batting Team:</strong> {secondInnings.battingTeam}</p>
              <p><strong>Score:</strong> {formatInningsScore(secondInnings)}</p>
              {secondInnings.target && (
                <p><strong>Target:</strong> {secondInnings.target}</p>
              )}
            </div>
            <div>
              <p><strong>Bowling Team:</strong> {secondInnings.bowlingTeam}</p>
              <p><strong>Overs Limit:</strong> {secondInnings.oversLimit}</p>
            </div>
          </div>

          {/* Batsmen Stats */}
          {secondInnings.batsmen && secondInnings.batsmen.length > 0 && (
            <div>
              <h4>Batting Stats:</h4>
              <table className={styles.statsTable}>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th style={{ textAlign: "center" }}>Runs</th>
                    <th style={{ textAlign: "center" }}>Balls</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {secondInnings.batsmen.map((batsman, idx) => (
                    batsman.status !== "yet_to_bat" && (
                      <tr key={idx}>
                        <td>{batsman.name}</td>
                        <td style={{ textAlign: "center" }}>{batsman.runs}</td>
                        <td style={{ textAlign: "center" }}>{batsman.balls}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`${styles.statusBadge} ${batsman.status === "out" ? styles.statusOut : styles.statusBatting}`}>
                            {batsman.status === "out" ? "OUT" : "BATTING"}
                          </span>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}

            {/* Bowlers Stats */}
            {secondInnings.bowlers && secondInnings.bowlers.length > 0 && (
              <div>
                <h4>Bowling Stats:</h4>
                <table className={styles.statsTable}>
                  <thead>
                    <tr>
                      <th>Bowler</th>
                      <th style={{ textAlign: "center" }}>Overs</th>
                      <th style={{ textAlign: "center" }}>Runs</th>
                      <th style={{ textAlign: "center" }}>Wickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secondInnings.bowlers.map((bowler, idx) => (
                      (bowler.overs > 0 || bowler.wickets > 0) && (
                        <tr key={idx}>
                          <td>{bowler.name}</td>
                          <td style={{ textAlign: "center" }}>{bowler.overs}</td>
                          <td style={{ textAlign: "center" }}>{bowler.runs}</td>
                          <td style={{ textAlign: "center" }}>{bowler.wickets}</td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navSection}>
          <Link href="/dashboard">
            <button className={styles.dashboardButton}>
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
