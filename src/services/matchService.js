// src/services/matchService.js
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
// import User from "@/models/User";
import Team from "@/models/Team";

/**
 * Create a new match
 */
export async function createMatch({ teamA, teamB, overs, userId }) {
  await connectDB();

  const match = new Match({
    createdBy: userId,
    teamA,
    teamB,
    oversLimit: overs,
    status: "CREATED",
    currentInnings: 0,
    innings: [],
  });

  await match.save();

  // Note: Match history is fetched by querying matches where createdBy = userId
  // No need to maintain separate matchHistory array in User model

  return match;
}

/**
 * Get match by ID
 */
export async function getMatchById(matchId) {
  await connectDB();
  return Match.findById(matchId);
}

/**
 * Update match
 */
export async function updateMatch(match) {
  return match.save();
}

/**
 * Handle toss
 */
export async function completeToss(matchId, tossWinner, tossDecision) {
  const match = await getMatchById(matchId);

  if (!match) {
    throw new Error("Match not found");
  }

  // Determine batting and bowling teams
  // If decision is "bat", toss winner bats. If "bowl", toss winner bowls (other team bats)
  const battingTeam =
    tossDecision === "bat"
      ? tossWinner
      : tossWinner === match.teamA
        ? match.teamB
        : match.teamA;
  const bowlingTeam =
    tossDecision === "bat"
      ? tossWinner === match.teamA
        ? match.teamB
        : match.teamA
      : tossWinner;

  match.toss = {
    winner: tossWinner,
    decision: tossDecision,
  };

  // Initialize first innings
  const inningsData = await initializeInnings(
    1,
    battingTeam,
    bowlingTeam,
    match.oversLimit,
  );
  match.innings = [inningsData];
  match.currentInnings = 0;
  match.status = "IN_PROGRESS";

  await match.save();
  return match;
}

/**
 * Initialize an innings
 */
async function initializeInnings(
  inningsNumber,
  battingTeam,
  bowlingTeam,
  oversLimit,
) {
  // Get players from database
  const battingTeamData = await Team.findOne({ name: battingTeam });
  const bowlingTeamData = await Team.findOne({ name: bowlingTeam });

  const battingPlayers = (battingTeamData?.players || []).map((name, i) => ({
    name,
    runs: 0,
    balls: 0,
    status: i < 2 ? "batting" : "yet_to_bat",
  }));

  const bowlingPlayers = (bowlingTeamData?.players || []).map((name, i) => ({
    name,
    overs: 0,
    runs: 0,
    wickets: 0,
  }));

  return {
    inningsNumber,
    battingTeam,
    bowlingTeam,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    completed: false,
    striker: battingPlayers[0]?.name || "Striker",
    nonStriker: battingPlayers[1]?.name || "Non-Striker",
    currentBowler: bowlingPlayers[0]?.name || "Bowler",
    currentBowlerIndex: 0,
    batsmen: battingPlayers,
    bowlers: bowlingPlayers,
    ballLog: [],
    target: null,
    oversLimit,
  };
}

/**
 * Play a ball
 */
export async function playBall(matchId) {
  const match = await getMatchById(matchId);

  if (!match || match.status !== "IN_PROGRESS") {
    throw new Error("Match not in progress");
  }

  const currentInningsIndex = match.currentInnings;
  const innings = match.innings[currentInningsIndex];

  if (!innings || innings.completed) {
    throw new Error("Current innings is completed");
  }

  // Safety check: Initialize batsmen/bowlers if they don't exist
  if (!innings.batsmen || innings.batsmen.length === 0) {
    const battingTeamData = await Team.findOne({ name: innings.battingTeam });
    innings.batsmen = (battingTeamData?.players || []).map((name, i) => ({
      name,
      runs: 0,
      balls: 0,
      status: i < 2 ? "batting" : "yet_to_bat",
    }));
    innings.striker = innings.batsmen[0]?.name || "Striker";
    innings.nonStriker = innings.batsmen[1]?.name || "Non-Striker";
  }

  if (!innings.bowlers || innings.bowlers.length === 0) {
    const bowlingTeamData = await Team.findOne({ name: innings.bowlingTeam });
    innings.bowlers = (bowlingTeamData?.players || []).map((name, i) => ({
      name,
      overs: 0,
      runs: 0,
      wickets: 0,
    }));
    innings.currentBowler = innings.bowlers[0]?.name || "Bowler";
    innings.currentBowlerIndex = 0;
  }

  if (!innings.ballLog) {
    innings.ballLog = [];
  }

  // Generate random outcome: 0, 1, 2, 3, 4, 6, W
  const outcomes = [0, 1, 2, 3, 4, 6, "W"];
  const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

  // Update striker's stats
  const strikerIndex = innings.batsmen.findIndex(
    (b) => b.name === innings.striker,
  );
  if (strikerIndex !== -1) {
    innings.batsmen[strikerIndex].balls += 1;
  }

  let runs = 0;

  if (outcome === "W") {
    // Wicket
    innings.wickets += 1;
    innings.batsmen[strikerIndex].status = "out";

    // Bring next batsman
    const nextBatsmanIndex = innings.batsmen.findIndex(
      (b) => b.status === "yet_to_bat",
    );
    if (nextBatsmanIndex !== -1) {
      innings.batsmen[nextBatsmanIndex].status = "batting";
      innings.striker = innings.batsmen[nextBatsmanIndex].name;
    }

    // Check if all out
    if (innings.wickets >= 10) {
      innings.completed = true;
    }
  } else {
    // Runs
    runs = outcome === 0 ? 0 : outcome;
    innings.runs += runs;
    innings.batsmen[strikerIndex].runs += runs;

    // Swap strikers on odd runs
    if (runs % 2 === 1) {
      [innings.striker, innings.nonStriker] = [
        innings.nonStriker,
        innings.striker,
      ];
    }
  }

  // Update bowler's stats
  const bowlerIndex = innings.bowlers.findIndex(
    (b) => b.name === innings.currentBowler,
  );
  if (bowlerIndex !== -1) {
    innings.bowlers[bowlerIndex].runs += runs;
    if (outcome === "W") {
      innings.bowlers[bowlerIndex].wickets += 1;
    }
  }

  // Update balls and overs
  innings.balls += 1;
  if (innings.balls === 6) {
    innings.overs += 1;
    innings.balls = 0;

    // Swap strikers at end of over
    [innings.striker, innings.nonStriker] = [
      innings.nonStriker,
      innings.striker,
    ];

    // Change bowler
    const nextBowlerIndex =
      (innings.currentBowlerIndex + 1) % innings.bowlers.length;
    innings.currentBowlerIndex = nextBowlerIndex;
    innings.currentBowler = innings.bowlers[nextBowlerIndex].name;
  }

  // Log ball
  innings.ballLog.push({
    over: innings.overs,
    ball: innings.balls,
    outcome,
    runs,
  });

  // Check if innings is completed (overs or all out)
  if (innings.overs >= innings.oversLimit || innings.wickets >= 10) {
    innings.completed = true;
  }

  // Check if target achieved in second innings
  if (
    currentInningsIndex === 1 &&
    innings.target &&
    innings.runs >= innings.target
  ) {
    innings.completed = true;
  }

  // If first innings completed, set target for second
  if (currentInningsIndex === 0 && innings.completed && !match.innings[1]) {
    const target = innings.runs + 1;
    const secondInningsData = await initializeInnings(
      2,
      match.teamB === innings.battingTeam ? match.teamA : match.teamB,
      innings.battingTeam,
      innings.oversLimit,
    );
    secondInningsData.target = target;
    match.innings.push(secondInningsData);
  }

  // Check if match is completed
  if (currentInningsIndex === 1 && innings.completed) {
    determineWinner(match);
  }

  await match.save();
  return match;
}

/**
 * Pause match
 */
export async function pauseMatch(matchId) {
  const match = await getMatchById(matchId);

  if (!match) {
    throw new Error("Match not found");
  }

  match.status = "PAUSED";
  await match.save();
  return match;
}

/**
 * Resume match
 */
export async function resumeMatch(matchId) {
  const match = await getMatchById(matchId);

  if (!match) {
    throw new Error("Match not found");
  }

  match.status = "IN_PROGRESS";
  await match.save();
  return match;
}

/**
 * Start second innings
 */
export async function startSecondInnings(matchId) {
  const match = await getMatchById(matchId);

  if (!match || !match.innings[0] || !match.innings[0].completed) {
    throw new Error("First innings must be completed");
  }

  match.currentInnings = 1;
  await match.save();
  return match;
}

/**
 * Determine winner
 */
function determineWinner(match) {
  const firstInnings = match.innings[0];
  const secondInnings = match.innings[1];

  let winner, winType, winMargin;

  if (!secondInnings) {
    // Only one innings played (shouldn't happen in normal flow)
    match.status = "COMPLETED";
    return;
  }

  if (secondInnings.runs >= secondInnings.target) {
    // Second innings team won by chasing the target
    winner = secondInnings.battingTeam;
    const wicketsRemaining = 10 - secondInnings.wickets;
    winMargin = wicketsRemaining;
    winType = "wickets";
  } else if (secondInnings.completed) {
    // First innings team won by defending
    winner = firstInnings.battingTeam;
    const runShortfall = secondInnings.target - secondInnings.runs;
    winMargin = runShortfall;
    winType = "runs";
  } else {
    // Default case: if neither condition met (edge case)
    winner = firstInnings.battingTeam;
    winMargin = 0;
    winType = "runs";
  }

  match.result = {
    winner,
    winType,
    winMargin,
  };

  match.status = "COMPLETED";
}
