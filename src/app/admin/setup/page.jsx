"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSeedTeams() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/seed-teams", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to seed teams");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <Link href="/dashboard">
          <button style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            ↩ Back to Dashboard
          </button>
        </Link>
      </div>

      <div style={{
        backgroundColor: "#f5f5f5",
        padding: "30px",
        borderRadius: "8px"
      }}>
        <h1 style={{ marginTop: 0, textAlign: "center" }}>⚙️ Admin Setup</h1>

        <div style={{ marginTop: "30px" }}>
          <h3>Seed Teams Database</h3>
          <p style={{ color: "#666" }}>
            This will populate the database with cricket teams and their players.
            It will only work if no teams exist yet.
          </p>

          <button
            onClick={handleSeedTeams}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "1.1em",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Seeding Teams..." : "🌱 Seed Teams"}
          </button>

          {error && (
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              color: "#721c24"
            }}>
              ❌ Error: {error}
            </div>
          )}

          {result && (
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              color: "#155724"
            }}>
              <h4 style={{ marginTop: 0 }}>✅ Success!</h4>
              <p><strong>Message:</strong> {result.message}</p>
              <p><strong>Teams Created:</strong> {result.count}</p>
              {result.teams && (
                <div>
                  <p><strong>Teams:</strong></p>
                  <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                    {result.teams.map((team) => (
                      <li key={team.name}>
                        {team.name} ({team.country}) - {team.players} players
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#e7f3ff",
          borderRadius: "8px"
        }}>
          <h3 style={{ marginTop: 0 }}>📋 Available Teams</h3>
          <p style={{ color: "#666" }}>
            The following teams will be created:
          </p>
          <ul style={{ color: "#666" }}>
            <li>Bangladesh</li>
            <li>India</li>
            <li>Pakistan</li>
            <li>Sri Lanka</li>
            <li>Australia</li>
            <li>England</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
