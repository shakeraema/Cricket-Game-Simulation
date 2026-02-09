import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import ProfileSection from "@/components/Dashboard/ProfileSection";
import StatsGrid, { StatCard } from "@/components/Dashboard/StatsGrid";
import MatchCountWidget from "@/components/Dashboard/MatchCountWidget";
import MatchHistory from "@/components/Dashboard/MatchHistory";
import styles from "./Dashboard.enhanced.module.css";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 🔒 Auth guard
  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <main className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>🏏 Cricket Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Profile Section */}
      <ProfileSection user={user} />

      {/* Stats Section */}
      <StatsGrid>
        <StatCard 
          icon="📊" 
          label="Total Matches" 
          value={<MatchCountWidget />} 
        />
        <StatCard 
          icon="🏆" 
          label="Frequent Player" 
          value="Coming soon" 
        />
      </StatsGrid>

      {/* Start New Match */}
      <section className={styles.actionSection}>
        <h2>⚡ Ready to Play?</h2>
        <Link href="/match/new">
          <button className={styles.actionButton}>
            🏏 Start New Match
          </button>
        </Link>
      </section>

      {/* Match History */}
      <section className={styles.historySection}>
        <h2>📜 Previous Matches</h2>
        <MatchHistory />
      </section>
    </main>
  );
}
