import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";

export async function GET(req, context) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;

    if (!id) {
      return apiResponse.badRequest("Match ID missing");
    }

    await connectDB();

    const match = await Match.findById(id);

    if (!match) {
      return apiResponse.notFound("Match not found");
    }

    if (match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    return apiResponse.success("Match fetched successfully", match);
  } catch (error) {
    console.error("Get match error:", error);
    return apiResponse.error("Failed to fetch match", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
