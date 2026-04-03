"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import Link from "next/link";
import styles from "./MatchHistory.module.css";

export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = typeof window !== "undefined" && localStorage.getItem("authToken");
        if (!token) {
          setError("Please log in to view history");
          setLoading(false);
          return;
        }

        const response = await apiGet("/api/match/history", token);
        if (!response?.success) {
          setError(response?.message || "Unable to load match history");
          setLoading(false);
          return;
        }

        setMatches(Array.isArray(response.data) ? response.data.slice(0, 10) : []);
      } catch (err) {
        console.error("Match history error:", err);
        setError("Unable to load match history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p>Loading match history...</p>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className={styles.noMatches}>
        <p>No matches yet! Start your first match now.</p>
      </div>
    );
  }

  return (
    <div className={styles.historyTable}>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Teams</th>
            <th className={styles.centerAlign}>Overs</th>
            <th className={styles.centerAlign}>Status</th>
            <th className={styles.centerAlign}>Result</th>
            <th className={styles.centerAlign}>Action</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => {
            const statusDisplay =
              match.status === "COMPLETED"
                ? "Completed"
                : match.status === "PAUSED"
                  ? "Paused"
                  : "In Progress";

            const resultDisplay = match.result?.winner
              ? `${match.result.winner} won`
              : match.status === "COMPLETED"
                ? "Match ended"
                : "-";

            const canPlay =
              (match.status === "IN_PROGRESS" || match.status === "PAUSED") &&
              match.toss?.winner;

            const linkHref = canPlay ? `/match/${match._id}/play` : `/match/${match._id}/view`;
            const linkText = canPlay ? "Play" : "View";

            return (
              <tr key={match._id.toString()}>
                <td>{new Date(match.createdAt).toLocaleDateString()}</td>
                <td>
                  {match.teamA} vs {match.teamB}
                </td>
                <td className={styles.centerAlign}>{match.oversLimit ?? match.overs ?? "-"}</td>
                <td className={styles.centerAlign}>
                  <span className={styles[`status${statusDisplay.replace(" ", "")}`]}>
                    {statusDisplay}
                  </span>
                </td>
                <td className={styles.centerAlign}>
                  {resultDisplay === "-" ? (
                    <span className={styles.noResult}>-</span>
                  ) : (
                    resultDisplay
                  )}
                </td>
                <td className={styles.centerAlign}>
                  <Link href={linkHref}>
                    <button className={styles.actionButton}>{linkText}</button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
