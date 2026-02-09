import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    await connectDB();

    const matches = await Match.find({
      createdBy: auth.userId,
    }).sort({ createdAt: -1 });

    return apiResponse.success(matches);
  } catch (err) {
    return apiResponse.error("Failed to fetch match history");
  }
}
