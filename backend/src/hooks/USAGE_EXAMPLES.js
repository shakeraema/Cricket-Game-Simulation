/**
 * API Hooks Usage Examples
 * 
 * This file demonstrates how to use the reusable API hooks:
 * - useMatchApi()
 * - useAuthApi()
 * - useTeamApi()
 * 
 * These hooks are platform-agnostic and work with Next.js, React, and React Native
 */

// ============================================================================
// EXAMPLE 1: useAuthApi() - Authentication Hook
// ============================================================================

import { useState } from "react";
import { useAuthApi } from "@/hooks/useAuthApi";

function LoginComponent() {
  const { login, loading, error } = useAuthApi();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const user = await login(credentials);
    if (user) {
      console.log("Login successful:", user);
      // Navigate to dashboard
    }
  };

  return {
    handleLogin,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 2: useAuthApi() - Registration
// ============================================================================

function SignUpComponent() {
  const { register, loading, error } = useAuthApi();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignUp = async () => {
    const newUser = await register(formData);
    if (newUser) {
      console.log("Registration successful:", newUser);
      // Redirect to dashboard or confirmation page
    }
  };

  return {
    handleSignUp,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 3: useAuthApi() - Logout
// ============================================================================

function LogoutComponent() {
  const { logout, loading, error } = useAuthApi();

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      console.log("Logged out successfully");
      // Redirect to login page
    }
  };

  return {
    handleLogout,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 4: useTeamApi() - Fetch Teams
// ============================================================================

function TeamsListComponent() {
  const { getTeams, loading, error } = useTeamApi();
  const [teams, setTeams] = useState([]);

  const fetchTeams = async () => {
    const teamList = await getTeams();
    if (teamList) {
      setTeams(teamList);
    }
  };

  return {
    fetchTeams,
    teams,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 5: useTeamApi() - Create Team
// ============================================================================

function CreateTeamComponent() {
  const { createTeam, loading, error } = useTeamApi();
  const [teamName, setTeamName] = useState("");

  const handleCreateTeam = async () => {
    const newTeam = await createTeam({
      name: teamName,
      city: "City Name",
      coach: "Coach Name",
    });

    if (newTeam) {
      console.log("Team created:", newTeam);
      // Reset form or redirect
    }
  };

  return {
    handleCreateTeam,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 6: useTeamApi() - Add Player to Team
// ============================================================================

function AddPlayerComponent() {
  const { addPlayer, loading, error } = useTeamApi();

  const handleAddPlayer = async (teamId) => {
    const player = await addPlayer(teamId, {
      name: "Player Name",
      role: "batsman", // batsman, bowler, all-rounder
      jerseyNumber: 7,
    });

    if (player) {
      console.log("Player added:", player);
    }
  };

  return {
    handleAddPlayer,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 7: useMatchApi() - Create Match
// ============================================================================

function CreateMatchComponent() {
  const { createMatch, loading, error } = useMatchApi();

  const handleCreateMatch = async () => {
    const match = await createMatch({
      team1Id: "team1_id",
      team2Id: "team2_id",
      overs: 10,
      matchType: "T10",
    });

    if (match) {
      console.log("Match created:", match);
      // Navigate to match page
    }
  };

  return {
    handleCreateMatch,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 8: useMatchApi() - Get Match Details
// ============================================================================

function MatchDetailsComponent({ matchId }) {
  const { getMatch, loading, error } = useMatchApi();
  const [match, setMatch] = useState(null);

  const fetchMatch = async () => {
    const matchData = await getMatch(matchId);
    if (matchData) {
      setMatch(matchData);
    }
  };

  return {
    fetchMatch,
    match,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 9: useMatchApi() - Play Ball
// ============================================================================

function PlayBallComponent({ matchId }) {
  const { playBall, loading, error } = useMatchApi();

  const recordBall = async () => {
    const result = await playBall(matchId, {
      runs: 4,
      isWicket: false,
      ballType: "delivery", // delivery, wide, no-ball, etc
    });

    if (result) {
      console.log("Ball recorded:", result);
    }
  };

  return {
    recordBall,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 10: useMatchApi() - Manage Match State
// ============================================================================

function MatchControlsComponent({ matchId }) {
  const { pauseMatch, resumeMatch, startToss, loading, error } =
    useMatchApi();

  const handleStartToss = async () => {
    const result = await startToss(matchId);
    if (result) {
      console.log("Toss started");
    }
  };

  const handlePause = async () => {
    const result = await pauseMatch(matchId);
    if (result) {
      console.log("Match paused");
    }
  };

  const handleResume = async () => {
    const result = await resumeMatch(matchId);
    if (result) {
      console.log("Match resumed");
    }
  };

  return {
    handleStartToss,
    handlePause,
    handleResume,
    loading,
    error,
  };
}

// ============================================================================
// EXAMPLE 11: Combined Hook Usage in a Page/Screen Component
// ============================================================================

function DashboardComponent() {
  // Initialize all three hooks
  const authApi = useAuthApi();
  const matchApi = useMatchApi();
  const teamApi = useTeamApi();

  const [state, setState] = useState({
    matches: [],
    teams: [],
    currentUser: null,
  });

  // Initialize data on component mount
  const initializeData = async () => {
    // Fetch teams
    const teams = await teamApi.getTeams();
    if (teams) {
      setState((prev) => ({ ...prev, teams }));
    }

    // Fetch matches
    const matches = await matchApi.getMatches();
    if (matches) {
      setState((prev) => ({ ...prev, matches }));
    }

    // Get user profile
    const user = await authApi.getProfile();
    if (user) {
      setState((prev) => ({ ...prev, currentUser: user }));
    }
  };

  const handleCreateAndStartMatch = async () => {
    // Create new match
    const newMatch = await matchApi.createMatch({
      team1Id: state.teams[0]._id,
      team2Id: state.teams[1]._id,
      overs: 10,
    });

    if (newMatch) {
      // Start toss
      await matchApi.startToss(newMatch._id);
      console.log("Match created and toss started");
    }
  };

  const handleLogout = async () => {
    const result = await authApi.logout();
    if (result?.success) {
      // Redirect to login
      console.log("User logged out");
    }
  };

  return {
    initializeData,
    handleCreateAndStartMatch,
    handleLogout,
    state,
    isLoading:
      authApi.loading || matchApi.loading || teamApi.loading,
    error: authApi.error || matchApi.error || teamApi.error,
  };
}

// ============================================================================
// EXAMPLE 12: React Native Integration (No UI logic)
// ============================================================================

/**
 * This same hook would work identically in React Native:
 * 
 * import { useAuthApi } from './hooks/useAuthApi';
 * import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 * 
 * export function LoginScreen() {
 *   const { login, loading, error } = useAuthApi();
 *   
 *   const handleLogin = async () => {
 *     const user = await login({ email: 'test@example.com', password: '123' });
 *     if (user) {
 *       // Navigate using React Navigation (native-specific)
 *       navigation.navigate('Dashboard');
 *     }
 *   };
 *   
 *   return (
 *     <View style={styles.container}>
 *       <TouchableOpacity onPress={handleLogin} disabled={loading}>
 *         <Text>{loading ? 'Logging in...' : 'Login'}</Text>
 *       </TouchableOpacity>
 *       {error && <Text style={styles.error}>{error}</Text>}
 *     </View>
 *   );
 * }
 * 
 * The hook logic remains 100% identical, only the UI rendering changes!
 */

// ============================================================================
// KEY PRINCIPLES (NO UI LOGIC IN HOOKS)
// ============================================================================

/**
 * API hooks ONLY handle:
 * ✓ HTTP requests (apiGet, apiPost, apiPut, apiDelete)
 * ✓ Loading/error state management
 * ✓ Data transformation (if needed)
 * ✓ Token/auth management
 * 
 * API hooks DO NOT handle:
 * ✗ Component rendering
 * ✗ Conditional rendering logic
 * ✗ Styling
 * ✗ Navigation (beyond returning data)
 * ✗ UI-specific state (that shouldn't be in the hook)
 * 
 * This makes hooks:
 * - Framework-agnostic
 * - Reusable across web and mobile
 * - Testable in isolation
 * - Easy to understand and maintain
 */

export {
  LoginComponent,
  SignUpComponent,
  LogoutComponent,
  TeamsListComponent,
  CreateTeamComponent,
  AddPlayerComponent,
  CreateMatchComponent,
  MatchDetailsComponent,
  PlayBallComponent,
  MatchControlsComponent,
  DashboardComponent,
};
