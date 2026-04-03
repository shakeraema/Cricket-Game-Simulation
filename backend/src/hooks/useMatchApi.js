/**
 * Match API Hook
 * Handles all match-related API operations with loading/error state
 * Platform-agnostic: works with Next.js, React, React Native
 */

import { useState } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";

export function useMatchApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all matches or match history
   */
  const getMatches = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(`/api/match/history?page=${page}&limit=${limit}`);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch matches");
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
   * Fetch single match details
   */
  const getMatch = async (matchId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(`/api/match/${matchId}`);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch match");
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
   * Create new match
   */
  const createMatch = async (matchData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost("/api/match/create", matchData);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to create match");
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
   * Start toss
   */
  const startToss = async (matchId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(`/api/match/${matchId}/toss`, {});
      if (!response?.success) {
        throw new Error(response?.message || "Failed to start toss");
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
   * Start innings
   */
  const startInnings = async (matchId, inningsNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(
        `/api/match/${matchId}/start-innings`,
        { inningsNumber }
      );
      if (!response?.success) {
        throw new Error(response?.message || "Failed to start innings");
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
   * Play ball (record runs/wicket)
   */
  const playBall = async (matchId, ballData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(`/api/match/${matchId}/play-ball`, ballData);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to play ball");
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
   * Pause match
   */
  const pauseMatch = async (matchId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(`/api/match/${matchId}/pause`, {});
      if (!response?.success) {
        throw new Error(response?.message || "Failed to pause match");
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
   * Resume match
   */
  const resumeMatch = async (matchId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(`/api/match/${matchId}/resume`, {});
      if (!response?.success) {
        throw new Error(response?.message || "Failed to resume match");
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
    getMatches,
    getMatch,
    createMatch,
    startToss,
    startInnings,
    playBall,
    pauseMatch,
    resumeMatch,
  };
}
