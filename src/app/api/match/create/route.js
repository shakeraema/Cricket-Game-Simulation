import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { createMatch } from "@/services/matchService";

export async function POST(req) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
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

    return apiResponse.success({ matchId: match._id }, 201);
  } catch (error) {
    console.error("Create match error:", error);
    return apiResponse.error(error.message || "Failed to create match");
  }
}
