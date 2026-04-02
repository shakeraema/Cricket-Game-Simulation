import { useState } from "react";
import { loginWithCredentials } from "../services/authService";

export function useLogin(onLoginSuccess) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithCredentials({ email, password });

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(result);
      }
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  };
}
