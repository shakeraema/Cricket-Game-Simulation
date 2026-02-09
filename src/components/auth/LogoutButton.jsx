"use client";

import { signOut } from "next-auth/react";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  return (
    <button
      className={styles.logout}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Logout
    </button>
  );
}
