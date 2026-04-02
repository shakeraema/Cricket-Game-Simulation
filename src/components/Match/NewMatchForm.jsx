"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTeams } from "@/hooks/useTeams";
import { apiPost } from "@/lib/apiClient";
import styles from "./NewMatchForm.module.css";

export default function NewMatchForm() {
  const router = useRouter();
  const { teams, isLoading: loadingTeams } = useTeams();

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [overs, setOvers] = useState(5);
  const [creating, setCreating] = useState(false);

  async function handleCreateMatch(e) {
    e.preventDefault();
    if (creating) return;

    if (!teamA || !teamB || teamA === teamB) {
      alert("Please select two different teams");
      return;
    }

    setCreating(true);

    try {
      const data = await apiPost("/api/match/create", {
        teamA,
        teamB,
        overs,
      });

      if (!data?.success) {
        alert(data?.message || "Failed to create match");
        setCreating(false);
        return;
      }

      router.push(`/match/${data.data.matchId}`);
    } catch (error) {
      alert("Error: " + error.message);
      setCreating(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/dashboard">
          <button className={styles.backButton}>
            ↩ Back to Dashboard
          </button>
        </Link>

        <div className={styles.formCard}>
          <h1>🏏 Create New Match</h1>

          {loadingTeams ? (
            <div className={styles.loading}>Loading teams...</div>
          ) : teams.length === 0 ? (
            <p className={styles.noTeams}>No teams available. Please contact admin.</p>
          ) : (
            <form onSubmit={handleCreateMatch} className={styles.form}>
              {/* Team A Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Team A</label>
                <select
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className={styles.select}
                  disabled={loadingTeams}
                >
                  <option value="">Select Team A</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team.name}>
                      {team.name} ({team.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Team B Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Team B</label>
                <select
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className={styles.select}
                  disabled={loadingTeams}
                >
                  <option value="">Select Team B</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team.name} disabled={team.name === teamA}>
                      {team.name} ({team.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Overs Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Number of Overs</label>
                <select
                  value={overs}
                  onChange={(e) => setOvers(Number(e.target.value))}
                  className={styles.select}
                >
                  <option value={2}>2 Overs (Quick Match)</option>
                  <option value={5}>5 Overs (Standard)</option>
                  <option value={10}>10 Overs (Extended)</option>
                </select>
                <p className={styles.helpText}>Choose match duration</p>
              </div>

              {/* Summary */}
              {teamA && teamB && (
                <div className={styles.summary}>
                  <p>
                    <strong>{teamA}</strong> vs <strong>{teamB}</strong> • {overs} Overs
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating || !teamA || !teamB}
                className={styles.submitButton}
              >
                {creating ? "Creating Match..." : "🎯 Proceed to Toss"}
              </button>
            </form>
          )}
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h3>📋 How It Works</h3>
          <ul>
            <li>Select two different teams</li>
            <li>Choose the number of overs</li>
            <li>Complete the toss on the next page</li>
            <li>Play ball-by-ball and track the match</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
