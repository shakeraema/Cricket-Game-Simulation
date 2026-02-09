import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { completeToss, getMatchById } from "@/services/matchService";

export async function POST(req) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { matchId, decision, tossWinner } = await req.json();

    if (!matchId || !decision || !tossWinner) {
      return apiResponse.badRequest(
        "Match ID, decision, and toss winner required",
      );
    }

    await connectDB();

    const match = await getMatchById(matchId);

    if (!match) {
      return apiResponse.notFound("Match not found");
    }

    // 🔒 OWNER CHECK
    if (match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    // Prevent multiple tosses
    if (match.toss?.winner && match.toss?.decision) {
      return apiResponse.badRequest("Toss already completed");
    }

    // Validate toss winner is one of the teams
    if (tossWinner !== match.teamA && tossWinner !== match.teamB) {
      return apiResponse.badRequest("Invalid toss winner");
    }

    const updatedMatch = await completeToss(matchId, tossWinner, decision);

    return apiResponse.success({
      message: "Toss completed",
      tossWinner: tossWinner,
      decision: decision,
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Toss error:", error);
    return apiResponse.error(error.message || "Failed to complete toss");
  }
}
