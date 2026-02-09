import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      required: true,
    },

    provider: {
      type: String,
      enum: ["google", "github", "credentials"],
      required: true,
    },

    password: String, // only for credentials login

    matchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
