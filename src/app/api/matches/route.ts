import { NextResponse } from "next/server";
import { fetchAllMatches } from "@/lib/api";

export async function GET() {
  try {
    const matches = await fetchAllMatches();
    return NextResponse.json(matches);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
