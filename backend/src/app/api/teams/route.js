import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { apiResponse, parseJsonBody } from "@/utils/apiResponse";
import { requireAdminAuth } from "@/middleware/authMiddleware";

/**
 * GET /api/teams
 * Get all teams
 */
export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find().sort({ name: 1 });
    return apiResponse.success("Teams fetched successfully", teams);
  } catch (error) {
    console.error("Fetch teams error:", error);
    return apiResponse.error("Failed to fetch teams", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}

/**
 * POST /api/teams
 * Create a new team (admin-only)
 */
export async function POST(request) {
  const auth = await requireAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const parsedBody = await parseJsonBody(request);
    if (!parsedBody.ok) return parsedBody.response;

    await connectDB();
    const body = parsedBody.data;

    const { name, country, players } = body;

    if (!name || !country || !players || players.length === 0) {
      return apiResponse.badRequest("Name, country, and players are required");
    }

    const team = new Team({ name, country, players });
    await team.save();

    return apiResponse.success("Team created successfully", team, 201);
  } catch (error) {
    console.error("Create team error:", error);
    return apiResponse.error("Failed to create team", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
