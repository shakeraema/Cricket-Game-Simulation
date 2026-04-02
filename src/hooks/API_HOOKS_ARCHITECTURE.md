/**
 * API Hooks Architecture Documentation
 * 
 * Three reusable, framework-agnostic API hooks for handling HTTP operations
 * with built-in loading and error state management.
 * 
 * Compatible with: Next.js, React, React Native
 */

// ============================================================================
// OVERVIEW
// ============================================================================

/**
 * useMatchApi() - Match operations (CRUD, game actions)
 * useAuthApi() - Authentication operations (login, register, logout)
 * useTeamApi() - Team operations (CRUD, player management)
 * 
 * Each hook:
 * - Calls apiClient functions (apiGet, apiPost, apiPut, apiDelete)
 * - Manages loading and error state internally
 * - Returns clean, named functions
 * - Contains NO UI logic (framework-agnostic)
 */

// ============================================================================
// ARCHITECTURE DESIGN
// ============================================================================

/**
 * STATE MANAGEMENT
 * ├── loading: boolean
 * │   └── Set to true during API request, false when complete
 * └── error: string | null
 *     └── Contains error message or null if no error
 * 
 * RETURN STRUCTURE
 * ├── State: { loading, error }
 * └── Methods: { functionName1, functionName2, ... }
 * 
 * PATTERN
 * Each API function:
 * 1. Sets loading = true
 * 2. Resets error = null
 * 3. Makes API call
 * 4. Handles success response
 * 5. Catches errors
 * 6. Sets loading = false
 * 7. Returns data or null
 */

// ============================================================================
// HOOK SPECIFICATIONS
// ============================================================================

/**
 * useMatchApi()
 * 
 * Returns object with:
 * {
 *   // State
 *   loading: boolean,
 *   error: string | null,
 *   
 *   // Methods
 *   getMatches(page, limit): Promise<Array>,
 *   getMatch(matchId): Promise<Object>,
 *   createMatch(matchData): Promise<Object>,
 *   startToss(matchId): Promise<Object>,
 *   startInnings(matchId, inningsNumber): Promise<Object>,
 *   playBall(matchId, ballData): Promise<Object>,
 *   pauseMatch(matchId): Promise<Object>,
 *   resumeMatch(matchId): Promise<Object>,
 * }
 */

/**
 * useAuthApi()
 * 
 * Returns object with:
 * {
 *   // State
 *   loading: boolean,
 *   error: string | null,
 *   
 *   // Methods
 *   register(userData): Promise<Object>,
 *   login(credentials): Promise<Object>,
 *   logout(): Promise<Object>,
 *   refreshToken(): Promise<Object>,
 *   getProfile(token?): Promise<Object>,
 * }
 */

/**
 * useTeamApi()
 * 
 * Returns object with:
 * {
 *   // State
 *   loading: boolean,
 *   error: string | null,
 *   
 *   // Methods
 *   getTeams(): Promise<Array>,
 *   getTeam(teamId): Promise<Object>,
 *   createTeam(teamData): Promise<Object>,
 *   updateTeam(teamId, teamData): Promise<Object>,
 *   deleteTeam(teamId): Promise<Object>,
 *   getTeamPlayers(teamId): Promise<Array>,
 *   addPlayer(teamId, playerData): Promise<Object>,
 *   removePlayer(teamId, playerId): Promise<Object>,
 *   seedTeams(): Promise<Object>,
 * }
 */

// ============================================================================
// USAGE PATTERNS
// ============================================================================

/**
 * BASIC USAGE
 * 
 * const { functionName, loading, error } = useHookName();
 * 
 * const handleAction = async () => {
 *   const result = await functionName(params);
 *   if (result) {
 *     // Success
 *   }
 * };
 */

/**
 * MULTIPLE OPERATIONS
 * 
 * const { createTeam, addPlayer, loading, error } = useTeamApi();
 * 
 * const setupTeam = async (teamData, players) => {
 *   // Create team
 *   const newTeam = await createTeam(teamData);
 *   if (!newTeam) return;
 *   
 *   // Add players sequentially
 *   for (const player of players) {
 *     await addPlayer(newTeam._id, player);
 *   }
 * };
 */

/**
 * COMBINED HOOKS
 * 
 * const auth = useAuthApi();
 * const teams = useTeamApi();
 * const matches = useMatchApi();
 * 
 * const isLoading = auth.loading || teams.loading || matches.loading;
 * const hasError = auth.error || teams.error || matches.error;
 */

/**
 * WITH LOCAL STATE
 * 
 * const { getMatches, loading, error } = useMatchApi();
 * const [matches, setMatches] = useState([]);
 * 
 * const fetchMatches = async () => {
 *   const data = await getMatches();
 *   if (data) setMatches(data);
 * };
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * 1. SEPARATE CONCERNS
 *    ✓ API logic in hooks
 *    ✓ UI logic in components
 *    ✓ State management separate from rendering
 * 
 * 2. ERROR HANDLING
 *    ✓ Always check if result is null
 *    ✓ Display error.value or error state
 *    ✓ Log errors for debugging
 * 
 *    const handleAction = async () => {
 *      const result = await createMatch(data);
 *      if (!result) {
 *        console.error('Failed to create match:', error);
 *        return;
 *      }
 *      // Success handling
 *    };
 * 
 * 3. LOADING STATES
 *    ✓ Disable buttons during loading
 *    ✓ Show loading indicators
 *    ✓ Prevent duplicate submissions
 * 
 * 4. AVOID UI-SPECIFIC LOGIC
 *    ✗ Don't use window.alert()
 *    ✗ Don't import UI components
 *    ✗ Don't do navigation routing
 *    ✗ Don't manage modal open/close states
 * 
 * 5. TOKEN MANAGEMENT
 *    - useAuthApi() handles token storage and header setting
 *    - Tokens persist in localStorage (Next.js) or secure storage (React Native)
 *    - Subsequent API calls automatically include token via apiClient
 */

// ============================================================================
// REACT NATIVE COMPATIBILITY CHECKLIST
// ============================================================================

/**
 * ✓ No window/document references
 * ✓ No localStorage references (wrapped in typeof check)
 * ✓ No axios instance browser specifics
 * ✓ Plain async/await pattern
 * ✓ useState for state management
 * ✓ No JSX or React components in hooks
 * ✓ No DOM manipulation
 * ✓ Pure data/state management only
 * 
 * The same hooks work identically in React Native:
 * - No hook code needs to change
 * - Only component rendering differs
 * - Navigation uses React Navigation instead of Next.js router
 */

// ============================================================================
// API RESPONSE FORMAT
// ============================================================================

/**
 * All API endpoints should return consistent format:
 * 
 * SUCCESS:
 * {
 *   success: true,
 *   data: { ... },
 *   message: "Optional success message"
 * }
 * 
 * ERROR:
 * {
 *   success: false,
 *   message: "Error description",
 *   error: "error code"
 * }
 * 
 * Hooks expect this format and extract data accordingly
 */

// ============================================================================
// ERROR HANDLING FLOWCHART
// ============================================================================

/**
 * Hook Method Called
 *   ↓
 * Set loading = true, error = null
 *   ↓
 * API Request (apiGet/Post/Put/Delete)
 *   ├─ Success
 *   │  ├─ Check response.success
 *   │  ├─ SUCCESS: Return response.data
 *   │  └─ FAIL: Throw error, setError(message)
 *   │
 *   └─ Failure
 *      ├─ Catch error
 *      ├─ setError(error.message)
 *      └─ Return null
 *   ↓
 * Set loading = false
 *   ↓
 * Component receives (data | null), loading, error
 */

// ============================================================================
// MIGRATION FROM OLD HOOKS
// ============================================================================

/**
 * OLD: useMatch() with SWR
 * - Good for fetching static data
 * - Automatic caching and revalidation
 * - Not great for mutations
 * 
 * NEW: useMatchApi()
 * - Manual fetch calls
 * - Better for mutations (create, update, delete)
 * - Better for sequential operations
 * - Works in React Native
 * 
 * COEXIST:
 * You can use both patterns:
 * - useMatch() for real-time data (dashboard)
 * - useMatchApi().getMatch() for specific operations
 */

// ============================================================================
// TESTING HOOKS
// ============================================================================

/**
 * Hooks can be tested in isolation:
 * 
 * jest.mock('@/lib/apiClient');
 * 
 * test('should handle login error', async () => {
 *   apiPost.mockRejectedValue(new Error('Network error'));
 *   
 *   const { login, error } = renderHook(() => useAuthApi());
 *   await act(() => login({ ... }));
 *   
 *   expect(error).toBe('Network error');
 * });
 */

// ============================================================================
// FILE LOCATIONS
// ============================================================================

/**
 * /src/hooks/useMatchApi.js    - Match API hook
 * /src/hooks/useAuthApi.js     - Auth API hook
 * /src/hooks/useTeamApi.js     - Team API hook
 * /src/hooks/USAGE_EXAMPLES.js - Complete usage examples
 * /src/lib/apiClient.js        - Underlying axios client
 */

// ============================================================================
// RELATED FILES
// ============================================================================

/**
 * Dependencies:
 * - /src/lib/apiClient.js        (apiGet, apiPost, apiPut, apiDelete, setAuthToken)
 * 
 * Used by:
 * - /src/app/login/page.jsx
 * - /src/app/signup/page.jsx
 * - /src/app/dashboard/page.jsx
 * - /src/app/match/new/page.jsx
 * - /src/components/**/*.jsx (Match, Team, Admin components)
 */

export {};
