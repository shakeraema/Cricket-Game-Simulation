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
    // 1. Authenticate user
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    // 2. Get match ID
    const { id: matchId } = await params;

    if (!matchId) {
      return apiResponse.badRequest("Match ID is required");
    }

    await connectDB();

    // 3. Verify ownership
    const match = await getMatchById(matchId);
    if (!match || match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    // 4. Start second innings
    const updatedMatch = await startSecondInnings(matchId);

    // 5. Return success
    return apiResponse.success({
      success: true,
      message: "Second innings started successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Start innings error:", error);
    return apiResponse.error(error.message || "Failed to start second innings");
  }
}
