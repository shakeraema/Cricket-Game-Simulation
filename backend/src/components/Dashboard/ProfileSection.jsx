import styles from "./ProfileSection.module.css";

export default function ProfileSection({ user }) {
  return (
    <section className={styles.profileSection}>
      <h2>👤 Profile</h2>
      
      <div className={styles.profileContent}>
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt="Profile"
            width={80}
            height={80}
            className={styles.profileImage}
          />
        )}
        
        <div className={styles.profileInfo}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role || "user"}</p>
          {user.image && (
            <p className={styles.authProvider}>
              Logged in via {user.image ? "OAuth" : "Credentials"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
