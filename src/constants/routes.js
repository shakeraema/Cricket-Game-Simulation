/**
 * Application route constants
 */

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MATCH_NEW: "/match/new",
  MATCH_VIEW: (id) => `/match/${id}`,
  MATCH_PLAY: (id) => `/match/${id}/play`,
  MATCH_VIEW_RESULT: (id) => `/match/${id}/view`,
};
