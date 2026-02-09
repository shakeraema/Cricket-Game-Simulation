"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import styles from "./Signup.module.css";
import Link from "next/link";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to sign up");
        setIsLoading(false);
        return;
      }

      // Auto-login after signup
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: true,
        callbackUrl: "/dashboard",
      });

      if (!result?.ok) {
        setError("Login failed after signup. Please try logging in manually.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>

        <button
          className={styles.oauthButtonGoogle}
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Sign up with Google
        </button>

        <button
          className={styles.oauthButtonGithub}
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          Sign up with GitHub
        </button>

        <div className={styles.divider}>OR</div>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSignup}>
          <input
            className={styles.input}
            name="name"
            placeholder="Name"
            required
          />
          <input
            className={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            required
          />
          <input
            className={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            required
          />

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
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
