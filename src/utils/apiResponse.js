/**
 * Utility functions for standardized API responses
 */

export const apiResponse = {
  success: (data, status = 200) => {
    return Response.json(data, { status });
  },

  error: (message, status = 500) => {
    return Response.json({ error: message }, { status });
  },

  unauthorized: (message = "Unauthorized") => {
    return Response.json({ error: message }, { status: 401 });
  },

  badRequest: (message = "Bad Request") => {
    return Response.json({ error: message }, { status: 400 });
  },

  notFound: (message = "Not Found") => {
    return Response.json({ error: message }, { status: 404 });
  },

  forbidden: (message = "Forbidden") => {
    return Response.json({ error: message }, { status: 403 });
  },
};
