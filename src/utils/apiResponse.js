/**
 * Utility functions for standardized API responses
 * 
 * CROSS-PLATFORM COMPATIBLE:
 * - All responses use Response.json() - works on all platforms
 * - Uses request.headers.get() - standard Web API
 * - Returns { success, message, data } - language agnostic
 * 
 * Mobile Clients (React Native, Flutter, etc.):
 * - Set header: Authorization: Bearer <token>
 * - Set header: Content-Type: application/json
 * - Parse response JSON: { success, message, data }
 */

export const apiResponse = {
  success: (message = "Request successful", data = null, status = 200) => {
    return Response.json(
      {
        success: true,
        message,
        data,
      },
      { status },
    );
  },

  error: (message = "Request failed", error = "INTERNAL_SERVER_ERROR", status = 500) => {
    const data =
      typeof error === "string"
        ? { code: error }
        : (error ?? { code: "INTERNAL_SERVER_ERROR" });

    return Response.json(
      {
        success: false,
        message,
        data,
      },
      { status },
    );
  },

  unauthorized: (message = "Unauthorized") => {
    return apiResponse.error(message, "UNAUTHORIZED", 401);
  },

  badRequest: (message = "Bad Request") => {
    return apiResponse.error(message, "BAD_REQUEST", 400);
  },

  notFound: (message = "Not Found") => {
    return apiResponse.error(message, "NOT_FOUND", 404);
  },

  forbidden: (message = "Forbidden") => {
    return apiResponse.error(message, "FORBIDDEN", 403);
  },

  unsupportedMediaType: (message = "Content-Type must be application/json") => {
    return apiResponse.error(message, "UNSUPPORTED_MEDIA_TYPE", 415);
  },
};

/**
 * Check if request has JSON content type
 * Works on all platforms - uses response.headers.get()
 */
export function isJsonRequest(request) {
  const contentType = request.headers.get("content-type") || "";
  return contentType.toLowerCase().includes("application/json");
}

/**
 * Extract Authorization header for Bearer token
 * Cross-platform compatible - works with any HTTP client
 * 
 * @param {Request} request - Next.js Request object
 * @returns {string} Authorization header value (e.g., "Bearer eyJhbGc...")
 */
export function getAuthorizationHeader(request) {
  return request?.headers?.get("authorization") || "";
}

/**
 * Parse JSON request body
 * Cross-platform compatible - standard Web API
 */
export async function parseJsonBody(request) {
  if (!isJsonRequest(request)) {
    return {
      ok: false,
      response: apiResponse.unsupportedMediaType(),
    };
  }

  try {
    const body = await request.json();
    return {
      ok: true,
      data: body,
    };
  } catch {
    return {
      ok: false,
      response: apiResponse.badRequest("Invalid JSON body"),
    };
  }
}
