import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const matches = await Match.find({
      createdBy: auth.userId,
    }).sort({ createdAt: -1 });

    return apiResponse.success("Match history fetched successfully", matches);
  } catch (err) {
    return apiResponse.error("Failed to fetch match history", err.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
