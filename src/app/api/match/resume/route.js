import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { resumeMatch, getMatchById } from "@/services/matchService";

export async function POST(req) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { matchId } = await req.json();

    if (!matchId) {
      return apiResponse.badRequest("Match ID required");
    }

    await connectDB();

    const match = await getMatchById(matchId);

    if (!match) {
      return apiResponse.notFound("Match not found");
    }

    if (match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    if (match.status !== "PAUSED") {
      return apiResponse.badRequest("Match is not paused");
    }

    await resumeMatch(matchId);

    return apiResponse.success({ message: "Match resumed successfully" });
  } catch (error) {
    console.error("Resume error:", error);
    return apiResponse.error(error.message || "Failed to resume match");
  }
}
