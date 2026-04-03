// src/repositories/matchRepository.js
import Match from "@/models/Match";

/**
 * Fetch match by ID
 */
export async function getMatchById(matchId) {
  return Match.findById(matchId);
}

/**
 * Persist updated match
 */
export async function updateMatch(match) {
  return match.save();
}
