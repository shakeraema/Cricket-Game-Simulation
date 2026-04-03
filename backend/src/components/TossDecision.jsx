"use client";

import { useState } from "react";

export function TossDecision({ teamA, teamB, tossWinner, onDecision }) {
  const [selectedDecision, setSelectedDecision] = useState(null);

  const handleDecision = (decision) => {
    setSelectedDecision(decision);
    onDecision(decision);
  };

  return (
    <div style={{
      display: "flex",
      gap: "20px",
      justifyContent: "center",
      marginTop: "30px"
    }}>
      <button
        onClick={() => handleDecision("bat")}
        disabled={selectedDecision !== null}
        style={{
          padding: "15px 30px",
          fontSize: "1.1em",
          backgroundColor: selectedDecision === "bat" ? "#28a745" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: selectedDecision !== null ? "not-allowed" : "pointer",
          opacity: selectedDecision !== null && selectedDecision !== "bat" ? 0.5 : 1,
          minWidth: "150px"
        }}
      >
        🏏 Bat First
      </button>
      <button
        onClick={() => handleDecision("bowl")}
        disabled={selectedDecision !== null}
        style={{
          padding: "15px 30px",
          fontSize: "1.1em",
          backgroundColor: selectedDecision === "bowl" ? "#dc3545" : "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: selectedDecision !== null ? "not-allowed" : "pointer",
          opacity: selectedDecision !== null && selectedDecision !== "bowl" ? 0.5 : 1,
          minWidth: "150px"
        }}
      >
        🎯 Bowl First
      </button>
    </div>
  );
}