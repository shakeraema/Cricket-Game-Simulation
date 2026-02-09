import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import Link from "next/link";
import styles from "./MatchHistory.module.css";

export default async function MatchHistory() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return <p>Please log in to view history</p>;

    await connectDB();
    const userId = session.user.id || session.user._id;

    const matches = await Match.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (!matches || matches.length === 0) {
      return (
        <div className={styles.noMatches}>
          <p>No matches yet! Start your first match now 🏏</p>
        </div>
      );
    }

    return (
      <div className={styles.historyTable}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Teams</th>
              <th className={styles.centerAlign}>Overs</th>
              <th className={styles.centerAlign}>Status</th>
              <th className={styles.centerAlign}>Result</th>
              <th className={styles.centerAlign}>Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const statusDisplay =
                match.status === "COMPLETED"
                  ? "Completed"
                  : match.status === "PAUSED"
                  ? "Paused"
                  : "In Progress";

              const resultDisplay = match.result?.winner
                ? `${match.result.winner} won`
                : match.status === "COMPLETED"
                ? "Match ended"
                : "—";

              const canPlay =
                (match.status === "IN_PROGRESS" || match.status === "PAUSED") &&
                match.toss?.winner;

              const linkHref = canPlay ? `/match/${match._id}/play` : `/match/${match._id}/view`;
              const linkText = canPlay ? "Play" : "View";

              return (
                <tr key={match._id.toString()}>
                  <td>{new Date(match.createdAt).toLocaleDateString()}</td>
                  <td>
                    {match.teamA} vs {match.teamB}
                  </td>
                  <td className={styles.centerAlign}>{match.overs}</td>
                  <td className={styles.centerAlign}>
                    <span className={styles[`status${statusDisplay.replace(" ", "")}`]}>
                      {statusDisplay}
                    </span>
                  </td>
                  <td className={styles.centerAlign}>
                    {resultDisplay === "—" ? (
                      <span className={styles.noResult}>—</span>
                    ) : (
                      resultDisplay
                    )}
                  </td>
                  <td className={styles.centerAlign}>
                    <Link href={linkHref}>
                      <button className={styles.actionButton}>{linkText}</button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } catch (error) {
    console.error("Match history error:", error);
    return (
      <div className={styles.error}>
        <p>Unable to load match history</p>
      </div>
    );
  }
}
