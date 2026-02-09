import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

/**
 * GET /api/teams
 * Get all teams
 */
export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find().sort({ name: 1 });
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Fetch teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/teams
 * Create a new team (for admin/seeding)
 */
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, country, players } = body;

    if (!name || !country || !players || players.length === 0) {
      return NextResponse.json(
        { error: "Name, country, and players are required" },
        { status: 400 },
      );
    }

    const team = new Team({ name, country, players });
    await team.save();

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create team" },
      { status: 500 },
    );
  }
}
