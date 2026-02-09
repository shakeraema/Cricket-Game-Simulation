"use client";
import { useState } from "react";
import { teams } from "@/lib/teams";
import styles from "./CreateMatch.module.css";

export default function CreateMatch() {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [overs, setOvers] = useState(2);

  async function createMatch() {
     if (!teamA || !teamB || teamA === teamB) {
    alert("Please select two different teams");
    return;
     }
    // 1️⃣ Toss winner already decided
const tossWinner = Math.random() < 0.5 ? teamA : teamB;

// 2️⃣ Toss decision (bat or bowl)
const tossDecision = Math.random() < 0.5 ? "bat" : "bowl";

// 3️⃣ Decide batting & bowling teams
let battingTeam, bowlingTeam;

if (tossDecision === "bat") {
  battingTeam = tossWinner;
  bowlingTeam = tossWinner === teamA ? teamB : teamA;
} else {
  bowlingTeam = tossWinner;
  battingTeam = tossWinner === teamA ? teamB : teamA;
}

    const res = await fetch("/api/match/create", {
      method: "POST",
      body: JSON.stringify({ teamA, teamB, overs, tossWinner, tossDecision, battingTeam, bowlingTeam }),
    });
    const match = await res.json();
    window.location.href = `/match/${match._id}`;
  }

  return (
    <section className={styles.setup}>
      <h1>Match Setup</h1>

      <div className={styles.form}>
        <label className={styles.field}>
  Team A
  <select
    className={styles.select}
    onChange={(e) => setTeamA(e.target.value)}
  >

            <option value="">Select</option>
            {teams.map((t) => (
              <option key={t.name} value={t.name}>
              {t.name}
              </option>
))}
          </select>
        </label>
            
        <label className={styles.field}>
  Team B
  <select
    className={styles.select}
    onChange={(e) => setTeamB(e.target.value)}
  >
            <option value="">Select</option>
            {teams.map((t) => (
              <option key={t.name} value={t.name}>
              {t.name}
              </option>
))}

          </select>
        </label>

        <label>
          Overs
          <select onChange={(e) => setOvers(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </label>

        <button className={styles.startBtn} onClick={createMatch}>Start Match</button>
      </div>
    </section>
  );
}
