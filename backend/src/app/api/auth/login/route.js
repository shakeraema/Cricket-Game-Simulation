import { createToken, getTokenMaxAge } from "@/lib/jwtUtils";
import { apiResponse, parseJsonBody } from "@/utils/apiResponse";
import { findUserByEmail } from "@/repositories/userRepository";
import { verifyPassword } from "@/services/authService";

/**
 * POST /api/auth/login
 * 
 * Credentials-based login that returns a Bearer token.
 * Works with any HTTP client: browsers, React Native, cURL, Postman, etc.
 * 
 * Request:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "token": "eyJhbGc...",
 *     "tokenType": "Bearer",
 *     "expiresIn": 2592000,
 *     "user": {
 *       "id": "userId123",
 *       "name": "John Doe",
 *       "email": "user@example.com"
 *     }
 *   }
 * }
 */
export async function POST(request) {
  try {
    const parsedBody = await parseJsonBody(request);
    if (!parsedBody.ok) return parsedBody.response;

    const { email, password } = parsedBody.data || {};

    if (!email || !password) {
      return apiResponse.badRequest("Email and password are required");
    }

    const user = await findUserByEmail(email);

    if (!user || user.provider !== "credentials" || !user.password) {
      return apiResponse.unauthorized("Invalid email or password");
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return apiResponse.unauthorized("Invalid email or password");
    }

    // Create JWT token using standalone utility (no NextAuth dependency)
    const token = createToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || "user",
    });

    return apiResponse.success("Login successful", {
      token,
      tokenType: "Bearer",
      expiresIn: getTokenMaxAge(),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return apiResponse.error("Login failed", error.message || "LOGIN_ERROR", 500);
  }
}
