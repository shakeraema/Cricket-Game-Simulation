import mongoose from "mongoose";

const BatsmanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["batting", "out", "yet_to_bat"],
      default: "yet_to_bat",
    },
  },
  { _id: false },
);

const BowlerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    overs: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
  },
  { _id: false },
);

const BallLogSchema = new mongoose.Schema(
  {
    over: { type: Number, required: true },
    ball: { type: Number, required: true },
    outcome: { type: mongoose.Schema.Types.Mixed, required: true },
    runs: { type: Number, default: 0 },
  },
  { _id: false },
);

const InningsSchema = new mongoose.Schema(
  {
    inningsNumber: { type: Number, required: true },
    battingTeam: { type: String, required: true },
    bowlingTeam: { type: String, required: true },

    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },

    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },

    target: { type: Number, default: null },
    oversLimit: { type: Number, required: true },
    completed: { type: Boolean, default: false },

    striker: { type: String, default: null },
    nonStriker: { type: String, default: null },
    currentBowler: { type: String, default: null },
    currentBowlerIndex: { type: Number, default: 0 },

    batsmen: { type: [BatsmanSchema], default: [] },
    bowlers: { type: [BowlerSchema], default: [] },
    ballLog: { type: [BallLogSchema], default: [] },
  },
  { _id: false },
);

const BallEventSchema = new mongoose.Schema(
  {
    innings: { type: Number, required: true },
    over: { type: Number, required: true },
    ball: { type: Number, required: true },

    eventType: {
      type: String,
      enum: ["RUN", "WICKET", "EXTRA"],
      required: true,
    },

    runs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const MatchSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      required: true,
    },

    teamA: { type: String, required: true },
    teamB: { type: String, required: true },

    oversLimit: { type: Number, required: true },

    toss: {
      winner: { type: String, default: null },
      decision: {
        type: String,
        enum: ["bat", "bowl"],
        default: null,
      },
    },

    status: {
      type: String,
      enum: ["CREATED", "IN_PROGRESS", "PAUSED", "COMPLETED"],
      default: "CREATED",
    },

    // 🔑 IMPORTANT: first innings index is 0, not 1
    currentInnings: { type: Number, default: 0 },

    // 🔑 IMPORTANT: innings is OPTIONAL at match creation
    innings: {
      type: [InningsSchema],
      default: [],
    },

    ballEvents: {
      type: [BallEventSchema],
      default: [],
    },

    result: {
      winner: { type: String, default: null },
      winByRuns: { type: Number, default: null },
      winByWickets: { type: Number, default: null },
    },
  },
  { timestamps: true },
);

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
