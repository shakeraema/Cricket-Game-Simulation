import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse, parseJsonBody } from "@/utils/apiResponse";
import { connectDB } from "@/lib/db";
import { completeToss, getMatchById } from "@/services/matchService";

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const parsedBody = await parseJsonBody(req);
    if (!parsedBody.ok) return parsedBody.response;

    const { matchId, decision, tossWinner } = parsedBody.data;
    const validTossWinners = ["teamA", "teamB"];
    const validDecisions = ["bat", "bowl"];

    if (
      typeof matchId !== "string" ||
      !validTossWinners.includes(tossWinner) ||
      !validDecisions.includes(decision)
    ) {
      return apiResponse.badRequest(
        "Invalid payload. Expected { matchId: string, tossWinner: \"teamA\" | \"teamB\", decision: \"bat\" | \"bowl\" }",
      );
    }

    await connectDB();

    const match = await getMatchById(matchId);

    if (!match) {
      return apiResponse.notFound("Match not found");
    }

    // 🔒 OWNER CHECK
    if (match.createdBy.toString() !== auth.userId) {
      return apiResponse.forbidden();
    }

    // Prevent multiple tosses
    if (match.toss?.winner && match.toss?.decision) {
      return apiResponse.badRequest("Toss already completed");
    }

    const selectedTossWinnerName =
      tossWinner === "teamA" ? match.teamA : match.teamB;

    const updatedMatch = await completeToss(
      matchId,
      selectedTossWinnerName,
      decision,
    );

    return apiResponse.success("Toss completed", {
      tossWinner,
      tossWinnerName: selectedTossWinnerName,
      decision,
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Toss error:", error);
    return apiResponse.error("Failed to complete toss", error.message || "INTERNAL_SERVER_ERROR", 500);
  }
}
