import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse, parseJsonBody } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { createMatch } from "@/services/matchService";

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const parsedBody = await parseJsonBody(req);
    if (!parsedBody.ok) return parsedBody.response;

    const body = parsedBody.data;
    const { teamA, teamB, overs } = body || {};

    if (!teamA || !teamB || !overs) {
      return apiResponse.badRequest("Invalid input");
    }

    if (teamA === teamB) {
      return apiResponse.badRequest("Teams must be different");
    }

    await connectDB();

    const match = await createMatch({
      teamA,
      teamB,
      overs,
      userId: auth.userId,
    });

    return apiResponse.success(
      "Match created successfully",
      { matchId: match._id },
      201,
    );
  } catch (error) {
    console.error("Create match error:", error);
    return apiResponse.error("Failed to create match", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
