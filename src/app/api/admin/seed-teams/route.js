import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

/**
 * POST /api/admin/seed-teams
 * Seed initial teams (for development only) - after that teams can be added via admin panel anytime
 */
export async function POST() {
  try {
    await connectDB();
    const existingTeams = await Team.countDocuments();
    if (existingTeams > 0) {
      return NextResponse.json(
        { message: "Teams already exist", count: existingTeams },
        { status: 200 },
      );
    }

    const teamsData = [
      {
        name: "Bangladesh",
        country: "Bangladesh",
        players: [
          "Tamim",
          "Litton",
          "Shanto",
          "Mushfiq",
          "Shakib",
          "Mahmudullah",
          "Mehidy",
          "Taskin",
          "Mustafiz",
          "Shoriful",
          "Hasan",
        ],
      },
      {
        name: "India",
        country: "India",
        players: [
          "Rohit",
          "Gill",
          "Kohli",
          "Rahul",
          "Iyer",
          "Hardik",
          "Jadeja",
          "Ashwin",
          "Shami",
          "Bumrah",
          "Siraj",
        ],
      },
      {
        name: "Pakistan",
        country: "Pakistan",
        players: [
          "Babar",
          "Fakhar",
          "Imam",
          "Harris",
          "Iftikhar",
          "Shan",
          "Hasnain",
          "Rauf",
          "Haris",
          "Shaheen",
          "Naseem",
        ],
      },
      {
        name: "Sri Lanka",
        country: "Sri Lanka",
        players: [
          "Pathum",
          "Dimuth",
          "Dhananjaya",
          "Charith",
          "Kamindu",
          "Angelo",
          "Wellalage",
          "Madushanka",
          "Chameera",
          "Theekshana",
          "Rajitha",
        ],
      },
      {
        name: "Australia",
        country: "Australia",
        players: [
          "David",
          "Steve",
          "Marnus",
          "Travis",
          "Mitchell",
          "Marcus",
          "Nathan",
          "Josh",
          "Mitchell",
          "Pat",
          "Scott",
        ],
      },
      {
        name: "England",
        country: "England",
        players: [
          "Joe",
          "Zak",
          "Harry",
          "Ollie",
          "Ben",
          "Liam",
          "Reece",
          "Chris",
          "Sam",
          "Brydon",
          "Gus",
        ],
      },
    ];

    const createdTeams = await Team.insertMany(teamsData);

    return NextResponse.json(
      {
        message: "Teams seeded successfully",
        count: createdTeams.length,
        teams: createdTeams.map((t) => ({
          name: t.name,
          country: t.country,
          players: t.players.length,
        })),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Seed teams error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed teams" },
      { status: 500 },
    );
  }
}
