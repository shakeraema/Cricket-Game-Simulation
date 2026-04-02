/**
 * Middleware for authentication in API routes
 * 
 * CROSS-PLATFORM PURE API AUTHENTICATION:
 * - Uses: Authorization: Bearer <token> header
 * - Works with: Next.js, React, React Native, cURL, Postman, etc.
 * - No session/cookie dependency - true stateless API
 * 
 * Usage:
 * 1. POST /api/auth/login → returns { token, tokenType: "Bearer" }
 * 2. All other APIs: Authorization: Bearer <token>
 * 3. Mobile/cURL compatible: curl -H "Authorization: Bearer <token>" http://api.example.com/api/endpoint
 */
import { verifyToken, getUserIdFromToken } from "@/lib/jwtUtils";
import { apiResponse, getAuthorizationHeader } from "@/utils/apiResponse";

function getBearerToken(authorizationHeader) {
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Extract and validate Bearer token (cross-platform auth)
 * @param {Request} request - Next.js Request object with headers.get()
 * @returns {Promise<Object>} { authorized, userId, role, response?, authType }
 */
export async function requireAuth(request) {
  if (!request) {
    return {
      authorized: false,
      response: apiResponse.unauthorized("Request object required"),
    };
  }

  // Extract Authorization header
  const authorizationHeader = getAuthorizationHeader(request);
  const bearerToken = getBearerToken(authorizationHeader);

  // Check header format
  if (authorizationHeader && !bearerToken) {
    return {
      authorized: false,
      response: apiResponse.unauthorized(
        "Invalid Authorization header format. Use: Authorization: Bearer <token>"
      ),
    };
  }

  // Check if token exists
  if (!bearerToken) {
    return {
      authorized: false,
      response: apiResponse.unauthorized(
        "Authentication required. Use: Authorization: Bearer <token>"
      ),
    };
  }

  // Verify token
  try {
    const tokenPayload = verifyToken(bearerToken);
    const userId = getUserIdFromToken(tokenPayload);

    if (!userId) {
      return {
        authorized: false,
        response: apiResponse.unauthorized("Invalid token: missing user ID"),
      };
    }

    return {
      authorized: true,
      userId,
      token: bearerToken,
      role: tokenPayload?.role || "user",
      email: tokenPayload?.email,
      name: tokenPayload?.name,
      authType: "bearer",
    };
  } catch (error) {
    console.error("Token verification error:", error.message);

    if (error.message.includes("expired")) {
      return {
        authorized: false,
        response: apiResponse.unauthorized("Token has expired"),
      };
    }

    return {
      authorized: false,
      response: apiResponse.unauthorized("Invalid or malformed token"),
    };
  }
}

/**
 * Require admin role
 * @param {Request} request - Next.js Request object
 * @returns {Promise<Object>} { authorized, userId, role, response? }
 */
export async function requireAdminAuth(request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth;

  if (auth.role !== "admin") {
    return {
      authorized: false,
      response: apiResponse.forbidden("Admin access required"),
    };
  }

  return auth;
}

/**
 * Optional auth - returns user info if authenticated, null otherwise
 * Useful for endpoints that work with or without auth
 * @param {Request} request - Next.js Request object
 * @returns {Promise<Object>} { userId, role, email, name } or null
 */
export async function getOptionalAuth(request) {
  if (!request) return null;

  const authorizationHeader = getAuthorizationHeader(request);
  const bearerToken = getBearerToken(authorizationHeader);

  if (!bearerToken) return null;

  try {
    const tokenPayload = verifyToken(bearerToken);
    const userId = getUserIdFromToken(tokenPayload);

    if (!userId) return null;

    return {
      userId,
      role: tokenPayload?.role || "user",
      email: tokenPayload?.email,
      name: tokenPayload?.name,
    };
  } catch (error) {
    return null;
  }
}
