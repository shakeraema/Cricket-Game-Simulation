import { useState } from "react";
import { registerWithCredentials } from "../services/authService";

export function useSignup(onSignupSuccess) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerWithCredentials({ name, email, password });

      if (typeof onSignupSuccess === "function") { // Check if onSignupSuccess is a function before calling it
        onSignupSuccess(result); // Pass the result to the onSignupSuccess callback, which can handle navigation or other post-signup logic
      }
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSignup,
  };
}
