"use client";

/**
 * Signup Page
 * Fully decoupled from NextAuth - API-based registration and login
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, setAuthToken } from "@/lib/apiClient";
import styles from "./Signup.module.css";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");

    try {
      // Register user
      const registerData = await apiPost("/api/auth/register", {
        name,
        email,
        password,
      });

      if (!registerData?.success) {
        setError(registerData?.message || "Failed to sign up");
        setIsLoading(false);
        return;
      }

      // Auto-login after signup
      const loginData = await apiPost("/api/auth/login", {
        email,
        password,
      });

      if (!loginData?.success) {
        setError("Sign up successful! Please log in manually.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      const token = loginData.data?.token;
      if (token) {
        setAuthToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
        }
        router.push("/dashboard");
      } else {
        setError("Login after signup failed. Please log in manually.");
        setIsLoading(false);
        router.push("/login");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSignup}>
          <input
            className={styles.input}
            name="name"
            placeholder="Full Name"
            required
            disabled={isLoading}
          />
          <input
            className={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            required
            disabled={isLoading}
          />
          <input
            className={styles.input}
            name="password"
            type="password"
            placeholder="Password (min. 6 characters)"
            required
            disabled={isLoading}
          />

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
