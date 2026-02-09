"use client";

import { signIn } from "next-auth/react";
import styles from "./Login.module.css";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>

        <button
          className={styles.oauthButtonGoogle}
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </button>

        <button
          className={styles.oauthButtonGithub}
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          Continue with GitHub
        </button>

        <div className={styles.divider}>OR</div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              callbackUrl: "/dashboard",
            });
          }}
        >
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            required
          />

          <button className={styles.submitButton} type="submit">
            Login
          </button>
        </form>

        <p className={styles.footerText}>
          Don’t have an account?{" "}
          <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
