import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";

export default async function MatchCountWidget() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return "0";

    await connectDB();
    const userId = session.user.id || session.user._id;
    
    const count = await Match.countDocuments({ createdBy: userId });
    return count;
  } catch {
    return "0";
  }
}
