/**
 * Middleware for authentication in API routes
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { apiResponse } from "@/utils/apiResponse";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: apiResponse.unauthorized(),
    };
  }

  return {
    authorized: true,
    session,
    userId: session.user.id,
  };
}
