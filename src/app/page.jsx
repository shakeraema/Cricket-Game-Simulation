import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import styles from "./Landing.module.css";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className={styles.landingContainer}>
      <div className={styles.hero}>
        <h1>🏏 Cricket Match Simulator</h1>
        <p>
          Run quick cricket matches with real scoring, overs, and wickets.
          Set up a game, win the toss, and play through each ball at your pace.
        </p>
      </div>

      <div className={styles.contentWrapper}>
        <section className={styles.featuresSection}>
          <h2>What you can do</h2>
          <ul className={styles.featureList}>
            <li>Start a match in a few clicks</li>
            <li>Choose overs (2, 5, or 10)</li>
            <li>Win the toss and decide to bat or bowl</li>
            <li>Play ball-by-ball with live score updates</li>
            <li>Pause and resume when you want</li>
            <li>See full match scorecards and results</li>
            <li>Track your past matches in the dashboard</li>
          </ul>
        </section>

        <section className={styles.ctaSection}>
          <h2>Ready to play?</h2>
          <p>Sign in or create an account to start your first match.</p>
          
          <div className={styles.ctaButtons}>
            <Link href="/login">
              <button className={`${styles.ctaButton} ${styles.ctaButtonPrimary}`}>
                Sign In
              </button>
            </Link>
            
            <Link href="/signup">
              <button className={`${styles.ctaButton} ${styles.ctaButtonSuccess}`}>
                Create Account
              </button>
            </Link>
          </div>
        </section>

        <section className={styles.footer}>
          <p>Works well on mobile and desktop • Secure sign-in • Fast gameplay</p>
        </section>
      </div>
    </main>
  );
}
