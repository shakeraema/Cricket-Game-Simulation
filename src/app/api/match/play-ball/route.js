import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse, parseJsonBody } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { playBall, getMatchById } from "@/services/matchService";

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const parsedBody = await parseJsonBody(req);
    if (!parsedBody.ok) return parsedBody.response;

    const { matchId } = parsedBody.data;

    if (!matchId) {
      return apiResponse.badRequest("Match ID required");
    }

    await connectDB();

    // Verify user owns this match
    const match = await getMatchById(matchId);
    if (!match) {
      return apiResponse.notFound("Match not found");
    }

    if (match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    const updatedMatch = await playBall(matchId);

    return apiResponse.success("Ball played successfully", {
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Play ball error:", error);
    return apiResponse.error("Failed to play ball", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
