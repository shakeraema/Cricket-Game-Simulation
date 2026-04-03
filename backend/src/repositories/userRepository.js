import User from "@/models/User";
import { connectDB } from "@/lib/db";


export async function createUser(data) {
  await connectDB();
  return User.create(data);
};

export async function findUserByEmail(email) {
  await connectDB();
  return User.findOne({ email });
};

export async function findUserById(id) {
  await connectDB();
  return User.findById(id);
};

export async function addMatchToUser(userId, matchId) {
  await connectDB();
  return User.findByIdAndUpdate(
    userId,
    { $push: { matchHistory: matchId } },
    { new: true }
  );
};
