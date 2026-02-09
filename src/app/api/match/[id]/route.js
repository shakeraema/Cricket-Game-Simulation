import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";

export async function GET(req, context) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  // ✅ FIX: params is async in Next 15
  const { id } = await context.params;

  if (!id) {
    return apiResponse.badRequest("Match ID missing");
  }

  await connectDB();

  const match = await Match.findById(id);

  if (!match) {
    return apiResponse.notFound("Match not found");
  }

  // 🔒 OWNERSHIP CHECK
  if (match.createdBy.toString() !== auth.userId) {
    return apiResponse.forbidden();
  }

  return apiResponse.success(match);
}
