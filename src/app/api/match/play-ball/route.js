import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { playBall, getMatchById } from "@/services/matchService";

export async function POST(req) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { matchId } = await req.json();

    if (!matchId) {
      return apiResponse.badRequest("Match ID required");
    }

    await connectDB();

    // Verify user owns this match
    const match = await getMatchById(matchId);
    if (!match || match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    const updatedMatch = await playBall(matchId);

    return apiResponse.success({
      message: "Ball played successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Play ball error:", error);
    return apiResponse.error(error.message || "Failed to play ball");
  }
}
