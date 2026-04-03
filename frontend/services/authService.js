import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearAuthToken,
  loginUser,
  registerUser,
  setAuthToken,
} from "./api";

const TOKEN_STORAGE_KEY = "authToken"; // Key for storing the auth token in AsyncStorage
const USER_STORAGE_KEY = "authUser";

async function persistSession({ token, user }) { // Store the token and user info in AsyncStorage
  const updates = [[TOKEN_STORAGE_KEY, token]]; // Always update the token
  if (user) { // Only update user info if it's provided (e.g., on login or registration)
    updates.push([USER_STORAGE_KEY, JSON.stringify(user)]); // Store user info as a JSON string
  }
  await AsyncStorage.multiSet(updates); // Use multiSet to save both token and user info in one operation
}

async function clearSessionStorage() { // Clear both token and user info from AsyncStorage on logout
  await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
}

async function createSessionFromLoginResponse(response) { // Process the login response to extract token and user info, and handle errors
  if (!response?.success) { // Check if the response indicates a successful login
    throw new Error(response?.message || "Login failed");
  }

  const token = response?.data?.token; // Extract the token from the response data
  if (!token) {
    throw new Error("No token received"); // If no token is received, throw an error
  }

  const user = response?.data?.user || null; // Extract user info if available, or set to null if not provided

  setAuthToken(token);
  await persistSession({ token, user }); // Persist the session by storing the token and user info in AsyncStorage

  return {
    token,
    user,
    raw: response,
  };
}

export async function loginWithCredentials({ email, password }) {
  const payload = {
    email: String(email || "").trim(),
    password: String(password || ""),
  };

  const response = await loginUser(payload);
  return createSessionFromLoginResponse(response);
}

export async function registerWithCredentials({ name, email, password }) {
  const payload = {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    password: String(password || ""),
  };

  const registerResponse = await registerUser(payload);

  if (!registerResponse?.success) {
    throw new Error(registerResponse?.message || "Registration failed");
  }

  return loginWithCredentials({ email: payload.email, password: payload.password });
}

export async function restoreSession() {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    clearAuthToken();
    return null;
  }

  // Only restore token if it appears to be a valid JWT (has 3 parts separated by dots)
  if (typeof token === 'string' && token.split('.').length === 3) {
    setAuthToken(token);
  } else {
    // Invalid token format - clear it
    console.warn('Invalid token format found in storage, clearing...');
    clearAuthToken();
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }

  let user = null;
  const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (userJson) {
    try {
      user = JSON.parse(userJson); 
      
      // parse meaning we expect it to be a valid JSON string, if not we catch the error and set user to null, how to convert back to string? JSON.stringify(user) when we save it in persistSession, and then JSON.parse(userJson) when we read it back in restoreSession. json string or object? we store it as a json string in AsyncStorage, and then parse it back into an object when we read it. This allows us to easily store complex user information without worrying about the structure, as long as it's JSON-serializable.

      
    } catch {
      user = null;
    }
  }

  return {
    token,
    user,
  };
}

export async function logout() {
  clearAuthToken();
  await clearSessionStorage();
}
