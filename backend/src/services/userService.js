import { createUser, findUserByEmail, addMatchToUser } from "@/repositories/userRepository";
import { hashPassword } from "./authService";

export const createCredentialsUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  return createUser({
    name,
    email,
    password: hashedPassword,
    provider: "credentials",
    matchHistory: [],
  });
};

export const attachMatchToUser = async (userId, matchId) => {
  return addMatchToUser(userId, matchId);
};
