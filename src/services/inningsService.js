// import matchRepository from '../repositories/matchRepository.js';
// import teams from '../lib/teams.js';

// /**
//  * Initialize the first innings of a match
//  * Creates innings[0] with batting lineup, bowler, and initial state
//  */
// export async function initializeFirstInnings(matchId) {
//   // 1. Get match from DB
//   const match = await matchRepository.findById(matchId);
  
//   if (!match) {
//     throw new Error('Match not found');
//   }

//   // 2. Validate state
//   if (match.status !== 'CREATED') {
//     throw new Error(`Cannot initialize innings. Match status is ${match.status}`);
//   }

//   if (!match.tossWinner || !match.electedTo) {
//     throw new Error('Toss must be completed before initializing innings');
//   }

//   // 3. Determine teams
//   const battingTeam = match.electedTo === 'bat' ? match.tossWinner : 
//                       (match.tossWinner === match.teamA ? match.teamB : match.teamA);
  
//   const bowlingTeam = battingTeam === match.teamA ? match.teamB : match.teamA;

//   // 4. Get player lists
//   const battingPlayers = TEAM_PLAYERS[battingTeam];
//   const bowlingPlayers = TEAM_PLAYERS[bowlingTeam];

//   if (!battingPlayers || !bowlingPlayers) {
//     throw new Error('Team players not found');
//   }

//   // 5. Select opening batsmen (first 2 players)
//   const striker = battingPlayers[0];
//   const nonStriker = battingPlayers[1];

//   // 6. Select opening bowler (first player from bowling team)
//   const currentBowler = bowlingPlayers[0];

//   // 7. Build innings object
//   const firstInnings = {
//     inningsNumber: 1,
//     battingTeam,
//     bowlingTeam,
//     runs: 0,
//     wickets: 0,
//     overs: 0,
//     balls: 0,
//     completed: false,
    
//     striker,
//     nonStriker,
//     currentBowler,
    
//     batsmen: [
//       {
//         name: striker,
//         runs: 0,
//         balls: 0,
//         fours: 0,
//         sixes: 0,
//         status: 'not out',
//         isOnStrike: true
//       },
//       {
//         name: nonStriker,
//         runs: 0,
//         balls: 0,
//         fours: 0,
//         sixes: 0,
//         status: 'not out',
//         isOnStrike: false
//       }
//     ],
    
//     bowlers: [
//       {
//         name: currentBowler,
//         overs: 0,
//         balls: 0,
//         runs: 0,
//         wickets: 0,
//         maidens: 0
//       }
//     ],
    
//     ballLog: []
//   };

//   // 8. Update match in DB (atomic operation)
//   const updatedMatch = await matchRepository.updateMatch(matchId, {
//     innings: [firstInnings],
//     status: 'IN_PROGRESS',
//     currentInnings: 1
//   });

//   return {
//     success: true,
//     match: updatedMatch,
//     innings: firstInnings
//   };
// }

// /**
//  * Get current innings state
//  */
// export async function getCurrentInnings(matchId) {
//   const match = await matchRepository.findById(matchId);
  
//   if (!match) {
//     throw new Error('Match not found');
//   }

//   if (!match.innings || match.innings.length === 0) {
//     return null;
//   }

//   // Return the active (incomplete) innings
//   const activeInnings = match.innings.find(inn => !inn.completed);
  
//   return activeInnings || match.innings[match.innings.length - 1];
// }

// export default {
//   initializeFirstInnings,
//   getCurrentInnings
// };