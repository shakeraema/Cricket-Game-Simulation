"use client";

/**
 * Login Page
 * Fully decoupled from NextAuth - API-based credentials login
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, setAuthToken } from "@/lib/apiClient";
import styles from "./Login.module.css";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const data = await apiPost("/api/auth/login", {
        email: formData.get("email"),
        password: formData.get("password"),
      });

      if (!data?.success) {
        setError(data?.message || "Login failed");
        setIsLoading(false);
        return;
      }

      const token = data.data?.token;
      if (token) {
        setAuthToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
        }
        router.push("/dashboard");
      } else {
        setError("No token received");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            required
            disabled={isLoading}
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            required
            disabled={isLoading}
          />

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.footerText}>
          Dont have an account?{" "}
          <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
