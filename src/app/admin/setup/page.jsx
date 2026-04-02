"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/apiClient";

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createResult, setCreateResult] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    country: "",
    playersText: "",
  });

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "admin") {
      setError("Admin access required");
      return;
    }

    setAuthorized(true);
  }, [router]);

  async function handleSeedTeams() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = typeof window !== "undefined" && localStorage.getItem("authToken");
      const data = await apiPost("/api/admin/seed-teams", {}, token);

      if (!data?.success) {
        setError(data?.message || "Failed to seed teams");
      } else {
        setResult({
          message: data.message,
          ...(data.data || {}),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam(e) {
    e.preventDefault();

    setCreateError(null);
    setCreateResult(null);

    const players = teamForm.playersText
      .split(/\n|,/) 
      .map((p) => p.trim())
      .filter(Boolean);

    if (!teamForm.name.trim() || !teamForm.country.trim() || players.length === 0) {
      setCreateError("Team name, country, and at least one player are required");
      return;
    }

    setCreatingTeam(true);
    try {
      const token = typeof window !== "undefined" && localStorage.getItem("authToken");
      const data = await apiPost(
        "/api/teams",
        {
          name: teamForm.name.trim(),
          country: teamForm.country.trim(),
          players,
        },
        token,
      );

      if (!data?.success) {
        setCreateError(data?.message || "Failed to create team");
        return;
      }

      setCreateResult(data.data);
      setTeamForm({ name: "", country: "", playersText: "" });
    } catch (err) {
      setCreateError(err.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  }

  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      {!authorized && !error && <p>Checking admin access...</p>}

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

      {authorized && (
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
          <h3 style={{ marginTop: 0 }}>➕ Add New Team</h3>
          <p style={{ color: "#666" }}>
            Admins can add any new team here. Players can be entered comma-separated or one per line.
          </p>

          <form onSubmit={handleCreateTeam}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                Team Name
              </label>
              <input
                type="text"
                value={teamForm.name}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. New Zealand"
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                disabled={creatingTeam}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                Country
              </label>
              <input
                type="text"
                value={teamForm.country}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="e.g. New Zealand"
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                disabled={creatingTeam}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                Players
              </label>
              <textarea
                value={teamForm.playersText}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, playersText: e.target.value }))}
                placeholder={"Player 1, Player 2, Player 3\nOR\nPlayer 1\nPlayer 2\nPlayer 3"}
                rows={6}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                disabled={creatingTeam}
              />
            </div>

            <button
              type="submit"
              disabled={creatingTeam}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "1.05em",
                backgroundColor: "#198754",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: creatingTeam ? "not-allowed" : "pointer",
                opacity: creatingTeam ? 0.6 : 1,
              }}
            >
              {creatingTeam ? "Creating Team..." : "➕ Create Team"}
            </button>
          </form>

          {createError && (
            <div style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              color: "#721c24"
            }}>
              ❌ {createError}
            </div>
          )}

          {createResult && (
            <div style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              color: "#155724"
            }}>
              ✅ Team created: <strong>{createResult.name}</strong> ({createResult.country})
            </div>
          )}
        </div>

        <div style={{
          marginTop: "20px",
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
      )}
    </main>
  );
}
