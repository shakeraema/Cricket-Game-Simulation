/**
 * POST /api/auth/logout
 * 
 * Stateless logout endpoint (token-based auth has no server-side state to clear)
 * Client deletes local token after calling this endpoint
 * 
 * Request:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 */
import { requireAuth } from "@/middleware/authMiddleware";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(request) {
  try {
    // Verify token is valid
    const auth = await requireAuth(request);
    if (!auth.authorized) return auth.response;

    // In a stateless JWT system, logout is just client-side token deletion
    // We could optionally:
    // - Log the logout event
    // - Add token to a blacklist (if maintaining one)
    // - Invalidate refresh tokens (if using them)

    // For now, just confirm we're logged in and logout succeeds
    return apiResponse.success("Logged out successfully");
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return apiResponse.error("Logout failed", error.message || "LOGOUT_ERROR", 500);
  }
}
