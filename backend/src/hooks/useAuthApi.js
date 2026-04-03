/**
 * Auth API Hook
 * Handles all authentication-related API operations with loading/error state
 * Platform-agnostic: works with Next.js, React, React Native
 */

import { useState } from "react";
import { apiPost, setAuthToken } from "@/lib/apiClient";

export function useAuthApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * User registration
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost("/api/auth/register", userData);
      if (!response?.success) {
        throw new Error(response?.message || "Registration failed");
      }
      // Store auth token if provided
      if (response.data?.token) {
        setAuthToken(response.data.token);
        // Store in localStorage (if available - for Next.js)
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", response.data.token);
        }
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
   * User login
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost("/api/auth/login", credentials);
      if (!response?.success) {
        throw new Error(response?.message || "Login failed");
      }
      // Store auth token if provided
      if (response.data?.token) {
        setAuthToken(response.data.token);
        // Store in localStorage (if available - for Next.js)
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", response.data.token);
        }
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
   * User logout
   */
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call logout endpoint if it exists
      const response = await apiPost("/api/auth/logout", {});
      if (!response?.success && response?.message) {
        console.warn("Logout API warning:", response.message);
      }

      // Clear token from client-side
      setAuthToken(null);

      // Clear from localStorage (if available)
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      // Still clear client-side token on error
      setAuthToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh authentication token
   */
  const refreshToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost("/api/auth/refresh", {});
      if (!response?.success) {
        throw new Error(response?.message || "Token refresh failed");
      }
      if (response.data?.token) {
        setAuthToken(response.data.token);
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", response.data.token);
        }
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
   * Get current user profile
   */
  const getProfile = async (token = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost("/api/auth/profile", {}, token);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch profile");
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
    register,
    login,
    logout,
    refreshToken,
    getProfile,
  };
}
