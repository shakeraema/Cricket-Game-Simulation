/**
 * Team API Hook
 * Handles all team-related API operations with loading/error state
 * Platform-agnostic: works with Next.js, React, React Native
 */

import { useState } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";

export function useTeamApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all teams
   */
  const getTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet("/api/teams");
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch teams");
      }
      return response.data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch single team details
   */
  const getTeam = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(`/api/teams/${teamId}`);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch team");
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new team
   */
  const createTeam = async (teamData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost("/api/teams", teamData);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to create team");
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update team
   */
  const updateTeam = async (teamId, teamData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPut(`/api/teams/${teamId}`, teamData);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to update team");
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete team
   */
  const deleteTeam = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPut(`/api/teams/${teamId}`, { deleted: true });
      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete team");
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch team players
   */
  const getTeamPlayers = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(`/api/teams/${teamId}/players`);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch players");
      }
      return response.data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add player to team
   */
  const addPlayer = async (teamId, playerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(
        `/api/teams/${teamId}/players`,
        playerData
      );
      if (!response?.success) {
        throw new Error(response?.message || "Failed to add player");
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove player from team
   */
  const removePlayer = async (teamId, playerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPut(
        `/api/teams/${teamId}/players/${playerId}`,
        { removed: true }
      );
      if (!response?.success) {
        throw new Error(response?.message || "Failed to remove player");
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seed initial teams (admin only)
   */
  const seedTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost("/api/admin/seed-teams", {});
      if (!response?.success) {
        throw new Error(response?.message || "Failed to seed teams");
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    loading,
    error,

    // Methods
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamPlayers,
    addPlayer,
    removePlayer,
    seedTeams,
  };
}
