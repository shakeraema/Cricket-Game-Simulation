import { connectDB } from "@/lib/db";
import { createCredentialsUser } from "@/services/userService";

export async function POST(req) {
  try {
    // ✅ CONNECT DATABASE HERE
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await createCredentialsUser({ name, email, password });

    return Response.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (err) {
  console.error("REGISTER ERROR:", err.message);

  return Response.json(
    { error: err.message || "Registration failed" },
    { status: 400 }
  );
}

}
