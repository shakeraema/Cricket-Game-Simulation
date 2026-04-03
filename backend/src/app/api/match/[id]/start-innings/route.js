import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { startSecondInnings, getMatchById } from "@/services/matchService.js";
import { connectDB } from "@/lib/db.js";

/**
 * POST /api/match/[id]/start-innings
 * Start second innings after first innings is completed
 */
export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) return auth.response;

    const { id: matchId } = await params;

    if (!matchId) {
      return apiResponse.badRequest("Match ID is required");
    }

    await connectDB();

    const match = await getMatchById(matchId);
    if (!match) {
      return apiResponse.notFound("Match not found");
    }

    if (match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    const updatedMatch = await startSecondInnings(matchId);

    return apiResponse.success("Second innings started successfully", {
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Start innings error:", error);
    return apiResponse.error("Failed to start second innings", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
