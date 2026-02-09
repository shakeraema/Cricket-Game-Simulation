import styles from "./StatsGrid.module.css";

export default function StatsGrid({ children }) {
  return (
    <section className={styles.statsGrid}>
      {children}
    </section>
  );
}

export function StatCard({ icon, label, value }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statIcon}>{icon}</p>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}
