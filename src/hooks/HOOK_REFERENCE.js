/* eslint-disable react-hooks/rules-of-hooks */
/**
 * API Hooks Quick Reference & Examples
 * 
 * Side-by-side comparisons showing practical usage patterns
 */

// ============================================================================
// QUICK REFERENCE TABLE
// ============================================================================

/**
 * ┌─────────────────────┬──────────────────┬─────────────────────┐
 * │ Hook                │ Main Purpose     │ Key Methods         │
 * ├─────────────────────┼──────────────────┼─────────────────────┤
 * │ useAuthApi()        │ User Auth        │ login, register,    │
 * │                     │                  │ logout, profile     │
 * ├─────────────────────┼──────────────────┼─────────────────────┤
 * │ useTeamApi()        │ Team Mgmt        │ getTeams, createTeam│
 * │                     │                  │ addPlayer, update   │
 * ├─────────────────────┼──────────────────┼─────────────────────┤
 * │ useMatchApi()       │ Match Game Logic │ createMatch, play   │
 * │                     │                  │ Ball, toss, pause   │
 * └─────────────────────┴──────────────────┴─────────────────────┘
 */

// ============================================================================
// AUTHENTICATION EXAMPLES
// ============================================================================

/**
 * LOGIN
 * ────────────────────────────────────────────────────────────
 */
async function exampleLogin() {
  const { login, loading, error } = useAuthApi();

  // Call login
  const user = await login({
    email: "user@example.com",
    password: "password123",
  });

  // Check result
  if (user) {
    console.log("Logged in as:", user.name);
    // Token automatically saved and headers set
    return user;
  } else {
    console.error("Login failed:", error);
  }
}

/**
 * REGISTRATION
 * ────────────────────────────────────────────────────────────
 */
async function exampleRegister() {
  const { register, error } = useAuthApi();

  const newUser = await register({
    name: "John Doe",
    email: "john@example.com",
    password: "secure123",
  });

  if (newUser) {
    console.log("User registered:", newUser.email);
    return newUser;
  } else {
    console.error("Registration error:", error);
  }
}

/**
 * USER PROFILE
 * ────────────────────────────────────────────────────────────
 */
async function exampleGetProfile() {
  const { getProfile, loading, error } = useAuthApi();

  const profile = await getProfile();

  if (profile) {
    console.log("Profile name:", profile.name);
    console.log("Profile email:", profile.email);
    return profile;
  } else {
    console.error("Could not fetch profile:", error);
  }
}

/**
 * LOGOUT
 * ────────────────────────────────────────────────────────────
 */
async function exampleLogout() {
  const { logout, loading } = useAuthApi();

  const result = await logout();

  if (result?.success) {
    console.log("Logged out successfully");
    // Token cleared, redirect to login
  }
}

// ============================================================================
// TEAM EXAMPLES
// ============================================================================

/**
 * GET ALL TEAMS
 * ────────────────────────────────────────────────────────────
 */
async function exampleGetTeams() {
  const { getTeams, loading, error } = useTeamApi();

  const teams = await getTeams();

  if (teams) {
    console.log("Available teams:", teams.length);
    teams.forEach((team) => {
      console.log(`- ${team.name} (${team.city})`);
    });
    return teams;
  } else {
    console.error("Failed to fetch teams:", error);
  }
}

/**
 * CREATE TEAM
 * ────────────────────────────────────────────────────────────
 */
async function exampleCreateTeam() {
  const { createTeam, loading, error } = useTeamApi();

  const newTeam = await createTeam({
    name: "Mumbai Tigers",
    city: "Mumbai",
    coach: "Rahul Sharma",
    foundedYear: 2024,
  });

  if (newTeam) {
    console.log("Team created with ID:", newTeam._id);
    return newTeam;
  } else {
    console.error("Team creation failed:", error);
  }
}

/**
 * GET SPECIFIC TEAM
 * ────────────────────────────────────────────────────────────
 */
async function exampleGetTeamDetails(teamId) {
  const { getTeam, loading } = useTeamApi();

  const team = await getTeam(teamId);

  if (team) {
    console.log(`Team: ${team.name}`);
    console.log(`City: ${team.city}`);
    console.log(`Coach: ${team.coach}`);
    return team;
  }
}

/**
 * ADD PLAYER TO TEAM
 * ────────────────────────────────────────────────────────────
 */
async function exampleAddPlayer(teamId) {
  const { addPlayer, loading, error } = useTeamApi();

  const player = await addPlayer(teamId, {
    name: "Virat Kohli",
    role: "batsman", // or "bowler", "all-rounder"
    jerseyNumber: 18,
    battingStyle: "right-handed",
    bowlingStyle: "right-arm fast", // if bowler
  });

  if (player) {
    console.log("Player added:", player.name);
    return player;
  } else {
    console.error("Failed to add player:", error);
  }
}

/**
 * GET TEAM PLAYERS
 * ────────────────────────────────────────────────────────────
 */
async function exampleGetTeamPlayers(teamId) {
  const { getTeamPlayers, loading } = useTeamApi();

  const players = await getTeamPlayers(teamId);

  if (players) {
    console.log(`Team has ${players.length} players`);
    players.forEach((player) => {
      console.log(`- #${player.jerseyNumber}: ${player.name} (${player.role})`);
    });
    return players;
  }
}

/**
 * UPDATE TEAM
 * ────────────────────────────────────────────────────────────
 */
async function exampleUpdateTeam(teamId) {
  const { updateTeam, error } = useTeamApi();

  const updated = await updateTeam(teamId, {
    coach: "New Coach Name",
    city: "New City",
  });

  if (updated) {
    console.log("Team updated successfully");
    return updated;
  } else {
    console.error("Update failed:", error);
  }
}

/**
 * SEED INITIAL TEAMS (Admin)
 * ────────────────────────────────────────────────────────────
 */
async function exampleSeedTeams() {
  const { seedTeams, loading } = useTeamApi();

  const result = await seedTeams();

  if (result) {
    console.log("Teams seeded successfully");
    return result;
  }
}

// ============================================================================
// MATCH EXAMPLES
// ============================================================================

/**
 * CREATE NEW MATCH
 * ────────────────────────────────────────────────────────────
 */
async function exampleCreateMatch() {
  const { createMatch, loading, error } = useMatchApi();

  const match = await createMatch({
    team1Id: "team1_mongodb_id",
    team2Id: "team2_mongodb_id",
    overs: 10,
    matchType: "T10",
    venue: "Cricket Ground",
  });

  if (match) {
    console.log("Match created with ID:", match._id);
    return match;
  } else {
    console.error("Match creation failed:", error);
  }
}

/**
 * GET MATCH LIST
 * ────────────────────────────────────────────────────────────
 */
async function exampleGetMatches() {
  const { getMatches, loading } = useMatchApi();

  const matches = await getMatches(1, 20); // page 1, 20 per page

  if (matches) {
    console.log(`Found ${matches.length} matches`);
    matches.forEach((match) => {
      console.log(
        `- ${match.team1.name} vs ${match.team2.name} (${match.status})`
      );
    });
    return matches;
  }
}

/**
 * GET SINGLE MATCH DETAILS
 * ────────────────────────────────────────────────────────────
 */
async function exampleGetMatchDetails(matchId) {
  const { getMatch, loading, error } = useMatchApi();

  const match = await getMatch(matchId);

  if (match) {
    console.log("Match Status:", match.status);
    console.log("Team 1:", match.team1.name, "Score:", match.team1Score);
    console.log("Team 2:", match.team2.name, "Score:", match.team2Score);
    return match;
  } else {
    console.error("Could not fetch match:", error);
  }
}

/**
 * CONDUCT TOSS
 * ────────────────────────────────────────────────────────────
 */
async function exampleStartToss(matchId) {
  const { startToss, loading, error } = useMatchApi();

  const tossResult = await startToss(matchId);

  if (tossResult) {
    console.log("Toss Winner:", tossResult.tossWinner.name);
    console.log("Elected to:", tossResult.elected); // "bat" or "bowl"
    return tossResult;
  } else {
    console.error("Toss failed:", error);
  }
}

/**
 * START INNINGS
 * ────────────────────────────────────────────────────────────
 */
async function exampleStartInnings(matchId) {
  const { startInnings, loading, error } = useMatchApi();

  // Start innings 1
  const innings = await startInnings(matchId, 1);

  if (innings) {
    console.log("Innings started");
    console.log("Batting team:", innings.battingTeam.name);
    console.log("Bowling team:", innings.bowlingTeam.name);
    return innings;
  } else {
    console.error("Could not start innings:", error);
  }
}

/**
 * PLAY BALL (Record Run/Wicket)
 * ────────────────────────────────────────────────────────────
 */
async function examplePlayBall(matchId) {
  const { playBall, loading, error } = useMatchApi();

  // Example 1: Record a 4
  const result1 = await playBall(matchId, {
    runs: 4,
    isWicket: false,
    ballType: "delivery",
  });

  // Example 2: Record a wicket
  const result2 = await playBall(matchId, {
    runs: 0,
    isWicket: true,
    ballType: "delivery",
    wicketType: "bowled",
  });

  // Example 3: Wide ball
  const result3 = await playBall(matchId, {
    ballType: "wide",
    runs: 1,
    isWicket: false,
  });

  if (result1) {
    console.log("Score updated:", result1.currentScore);
  }
}

/**
 * PAUSE MATCH
 * ────────────────────────────────────────────────────────────
 */
async function examplePauseMatch(matchId) {
  const { pauseMatch, loading } = useMatchApi();

  const result = await pauseMatch(matchId);

  if (result) {
    console.log("Match paused");
  }
}

/**
 * RESUME MATCH
 * ────────────────────────────────────────────────────────────
 */
async function exampleResumeMatch(matchId) {
  const { resumeMatch, loading } = useMatchApi();

  const result = await resumeMatch(matchId);

  if (result) {
    console.log("Match resumed");
  }
}

// ============================================================================
// COMPLEX SCENARIOS
// ============================================================================

/**
 * SCENARIO 1: Complete Match Flow
 * ────────────────────────────────────────────────────────────
 */
async function exampleCompleteMatchWorkflow() {
  const match = useMatchApi();
  const team = useTeamApi();

  try {
    // 1. Get teams
    const teams = await team.getTeams();
    const [team1, team2] = teams.slice(0, 2);

    // 2. Create match
    const newMatch = await match.createMatch({
      team1Id: team1._id,
      team2Id: team2._id,
      overs: 10,
    });
    console.log("✓ Match created");

    // 3. Start toss
    const tossResult = await match.startToss(newMatch._id);
    console.log("✓ Toss done -", tossResult.tossWinner.name, "won");

    // 4. Start innings
    const innings = await match.startInnings(newMatch._id, 1);
    console.log("✓ Innings started -", innings.battingTeam.name, "to bat");

    // 5. Play some balls
    for (let i = 0; i < 5; i++) {
      await match.playBall(newMatch._id, {
        runs: Math.random() > 0.5 ? 4 : 1,
        isWicket: false,
        ballType: "delivery",
      });
    }
    console.log("✓ Balls played");

    const finalMatch = await match.getMatch(newMatch._id);
    console.log("✓ Final score:", finalMatch.team1Score);
  } catch (err) {
    console.error("Match workflow error:", err);
  }
}

/**
 * SCENARIO 2: Setup Team with Players
 * ────────────────────────────────────────────────────────────
 */
async function exampleSetupTeamWithPlayers() {
  const teamApi = useTeamApi();

  try {
    // Create team
    const team = await teamApi.createTeam({
      name: "Champions XI",
      city: "Delhi",
      coach: "MS Dhoni",
    });
    console.log("✓ Team created");

    // Define players
    const players = [
      { name: "Virat Kohli", role: "batsman", jerseyNumber: 18 },
      { name: "Jasprit Bumrah", role: "bowler", jerseyNumber: 93 },
      { name: "Suryakumar Yadav", role: "all-rounder", jerseyNumber: 63 },
    ];

    // Add all players
    for (const playerData of players) {
      await teamApi.addPlayer(team._id, playerData);
      console.log(`✓ Added ${playerData.name}`);
    }

    // Get final team
    const updatedTeam = await teamApi.getTeam(team._id);
    console.log(`✓ Team setup complete with ${updatedTeam.playerCount} players`);
  } catch (err) {
    console.error("Team setup error:", err);
  }
}

/**
 * SCENARIO 3: Error Handling Pattern
 * ────────────────────────────────────────────────────────────
 */
async function exampleCompleteErrorHandling() {
  const { createMatch, loading, error } = useMatchApi();

  try {
    // Show loading state
    console.log("Creating match...", loading);

    const match = await createMatch({
      team1Id: "invalid_id",
      team2Id: "invalid_id",
    });

    if (!match) {
      // Hook caught an error
      console.error("API Error:", error);
      // Display error to user: error message
      return null;
    }

    // Success
    console.log("Match created:", match._id);
    return match;
  } catch (unexpectedError) {
    // Catch blocks only for unexpected errors
    console.error("Unexpected error:", unexpectedError);
  }
}

/**
 * SCENARIO 4: Real-time Data Refresh
 * ────────────────────────────────────────────────────────────
 */
async function exampleRealTimeMatchUpdate(matchId) {
  const { getMatch } = useMatchApi();

  // Poll match status every 2 seconds
  const pollInterval = setInterval(async () => {
    const match = await getMatch(matchId);

    if (match?.status === "completed") {
      console.log("Match ended!");
      clearInterval(pollInterval);
      return;
    }

    console.log("Current score:", match?.team1Score, match?.team2Score);
  }, 2000);

  // Return cleanup function
  return () => {
    clearInterval(pollInterval);
  };
}

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

/**
 * DO:
 * ✓ Use a single loading state for sequential operations
 * ✓ Cache match data when possible
 * ✓ Debounce rapid calls
 * ✓ Clear intervals/timeouts when done
 * 
 * DON'T:
 * ✗ Call playBall repeatedly without delay
 * ✗ Fetch same data multiple times
 * ✗ Leave polling intervals running
 * ✗ Make multiple simultaneous mutations
 */

export {
  exampleLogin,
  exampleRegister,
  exampleGetProfile,
  exampleLogout,
  exampleGetTeams,
  exampleCreateTeam,
  exampleGetTeamDetails,
  exampleAddPlayer,
  exampleGetTeamPlayers,
  exampleUpdateTeam,
  exampleSeedTeams,
  exampleCreateMatch,
  exampleGetMatches,
  exampleGetMatchDetails,
  exampleStartToss,
  exampleStartInnings,
  examplePlayBall,
  examplePauseMatch,
  exampleResumeMatch,
  exampleCompleteMatchWorkflow,
  exampleSetupTeamWithPlayers,
  exampleCompleteErrorHandling,
  exampleRealTimeMatchUpdate,
};
