/**
 * Reusable API client layer using Axios for mobile-friendly app
 * Compatible with both Next.js and React Native
 * Centralizes all HTTP requests and handles headers/authentication
 */

import axios from "axios";
import { autoInitReactNativeApiBaseUrl } from "@/lib/rnApiBootstrap";

function getBaseURL() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || undefined;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
//   || "http://192.168.0.146:8001", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Make API request with axios
 */
export async function apiRequest(url, method = "GET", body = null, token = null) {
  try {
    const config = {
      method,
      url,
      ...(body && { data: body }),
      ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    };

    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    // Preserve API errors coming from the backend.
    if (error.response) {
      return error.response.data;
    }

    // Normalize transport-level failures for consistent caller handling.
    return {
      success: false,
      message: error?.message || "Network request failed",
      data: {
        code: "NETWORK_ERROR",
      },
    };
  }
}

/**
 * GET request helper
 */
export async function apiGet(url, token = null) {
  return apiRequest(url, "GET", null, token);
}

/**
 * POST request helper
 */
export async function apiPost(url, body, token = null) {
  return apiRequest(url, "POST", body, token);
}

/**
 * PUT request helper
 */
export async function apiPut(url, body, token = null) {
  return apiRequest(url, "PUT", body, token);
}

/**
 * DELETE request helper
 */
export async function apiDelete(url, token = null) {
  return apiRequest(url, "DELETE", null, token);
}

/**
 * Set/update authorization token for all requests
 */
export function setAuthToken(token) {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

/**
 * Get axios instance for advanced usage (interceptors, etc)
 */
export function getAxiosInstance() {
  return axiosInstance;
}

/**
 * Override base URL at runtime (useful for React Native environments).
 */
export function setApiBaseUrl(baseUrl) {
  axiosInstance.defaults.baseURL = baseUrl || undefined;
}

// Auto-configure React Native base URL from env-driven mapping.
autoInitReactNativeApiBaseUrl(setApiBaseUrl);
