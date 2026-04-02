import axios from "axios";

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ;
  // || "http://localhost:3000/api"

const baseURL = RAW_BASE_URL.replace(/\/$/, "");

export const API = axios.create({
  baseURL,
  timeout: 15000,
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getAuthToken = () => authToken;



API.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

API.interceptors.request.use((config) => {
  console.log("[API REQ]", config.method?.toUpperCase(), `${config.baseURL}${config.url}`, config.data || null);
  return config;
});

API.interceptors.response.use(
  (res) => {
    console.log("[API RES]", res.status, `${res.config.baseURL}${res.config.url}`, res.data);
    return res;
  },
  (err) => {
    console.log("[API ERR]", err?.message, err?.config?.url, err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

const getData = (res) => res.data;

// Auth
export const registerUser = async (payload) => {
  const res = await API.post("/auth/register", payload);
  return getData(res);
};

export const loginUser = async (payload) => {
  const res = await API.post("/auth/login", payload);
  return getData(res);
};

export const logoutUser = async () => {
  const res = await API.post("/auth/logout");
  return getData(res);
};

// Teams
export const getTeams = async () => {
  const res = await API.get("/teams");
  return getData(res);
};

export const createTeam = async (teamPayload) => {
  const res = await API.post("/teams", teamPayload);
  return getData(res);
};

export const seedTeams = async () => {
  const res = await API.post("/admin/seed-teams");
  return getData(res);
};

// Match
export const createMatch = async (payload) => {
  const res = await API.post("/match/create", payload);
  return getData(res);
};

export const getMatchHistory = async () => {
  const res = await API.get("/match/history");
  return getData(res);
};

export const getMatchById = async (id) => {
  const res = await API.get(`/match/${id}`);
  return getData(res);
};

export const completeToss = async (payload) => {
  const res = await API.post("/match/toss", payload);
  return getData(res);
};

export const playBall = async (matchId) => {
  const res = await API.post("/match/play-ball", { matchId });
  return getData(res);
};

export const pauseMatch = async (matchId) => {
  const res = await API.post("/match/pause", { matchId });
  return getData(res);
};

export const resumeMatch = async (matchId) => {
  const res = await API.post("/match/resume", { matchId });
  return getData(res);
};

export const startSecondInnings = async (id) => {
  const res = await API.post(`/match/${id}/start-innings`);
  return getData(res);
};
