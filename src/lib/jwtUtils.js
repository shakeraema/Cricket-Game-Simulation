/**
 * Standalone JWT utilities - NO NextAuth dependency
 * 
 * Works with any platform:
 * - Next.js (SSR/API routes)
 * - React (client-side)
 * - React Native
 * - Any HTTP client (cURL, Postman, etc.)
 */

import jwt from "jsonwebtoken";

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Get JWT secret from environment
 * Throws if not configured
 */
function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT secret not configured. Set NEXTAUTH_SECRET or JWT_SECRET environment variable"
    );
  }
  return secret;
}

/**
 * Create a signed JWT token
 * @param {Object} payload - Token data (userId, email, role, etc.)
 * @param {number} expiresIn - Token expiration in seconds (default: 30 days)
 * @returns {string} Signed JWT token
 */
export function createToken(payload, expiresIn = TOKEN_MAX_AGE_SECONDS) {
  const secret = getSecret();
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token string
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  const secret = getSecret();
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    // Re-throw with more specific error messages
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
}

/**
 * Decode a token WITHOUT verification
 * Use only for debugging or when you trust the source
 * @param {string} token - JWT token string
 * @returns {Object|null} Decoded payload, null if invalid
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Extract user ID from decoded token
 * Handles different naming conventions (id, sub, userId)
 * @param {Object} decodedToken - jwt.verify() result
 * @returns {string|null} User ID or null if not found
 */
export function getUserIdFromToken(decodedToken) {
  if (!decodedToken) return null;
  return decodedToken.id || decodedToken.sub || decodedToken.userId || null;
}

/**
 * Get default token expiration time
 */
export function getTokenMaxAge() {
  return TOKEN_MAX_AGE_SECONDS;
}

/**
 * Create a test token (for development/testing only)
 * @param {string} userId - User ID
 * @returns {Object} { token, expiresIn }
 */
export function createTestToken(userId) {
  const token = createToken({
    id: userId,
    email: "test@example.com",
    name: "Test User",
  });

  return {
    token,
    expiresIn: TOKEN_MAX_AGE_SECONDS,
  };
}
