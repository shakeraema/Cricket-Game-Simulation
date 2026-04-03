import { apiResponse } from "@/utils/apiResponse";

const DEPRECATION_MESSAGE =
	"NextAuth endpoints are disabled for API-first auth. Use /api/auth/login, /api/auth/register, and Bearer tokens.";

export async function GET() {
	return apiResponse.error(
		DEPRECATION_MESSAGE,
		"NEXTAUTH_DISABLED",
		410,
	);
}

export async function POST() {
	return apiResponse.error(
		DEPRECATION_MESSAGE,
		"NEXTAUTH_DISABLED",
		410,
	);
}
