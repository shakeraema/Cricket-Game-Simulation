import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <p className={styles.text}>Loading application…</p>
    </div>
  );
}
