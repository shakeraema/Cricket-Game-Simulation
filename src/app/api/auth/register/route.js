import { connectDB } from "@/lib/db";
import { createCredentialsUser } from "@/services/userService";
import { apiResponse, parseJsonBody } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    const parsedBody = await parseJsonBody(req);
    if (!parsedBody.ok) return parsedBody.response;

    await connectDB();

    const { name, email, password } = parsedBody.data;

    if (!name || !email || !password) {
      return apiResponse.badRequest("All fields are required");
    }

    if (password.length < 6) {
      return apiResponse.badRequest("Password must be at least 6 characters");
    }

    await createCredentialsUser({ name, email, password });

    return apiResponse.success("User registered successfully", null, 201);
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);

    return apiResponse.error("Registration failed", err.message || "REGISTRATION_ERROR", 400);
  }
}
