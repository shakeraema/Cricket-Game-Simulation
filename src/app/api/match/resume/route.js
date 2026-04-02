import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse, parseJsonBody } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { resumeMatch, getMatchById } from "@/services/matchService";

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

    return apiResponse.success("Match resumed successfully", { matchId });
  } catch (error) {
    console.error("Resume error:", error);
    return apiResponse.error("Failed to resume match", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
