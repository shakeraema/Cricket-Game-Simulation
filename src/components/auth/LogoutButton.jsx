"use client";

/**
 * Logout Button
 * Fully decoupled from NextAuth
 * Uses API-based logout with Bearer token
 */

import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = typeof window !== "undefined" && localStorage.getItem("authToken");
      
      // Call logout API
      if (token) {
        await apiPost("/api/auth/logout", {}, token);
      }

      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if API call fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      router.push("/login");
    }
  };

  return (
    <button className={styles.logout} onClick={handleLogout}>
      Logout
    </button>
  );
}
