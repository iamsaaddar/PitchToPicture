import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getTmdbLanguages } from "@/services/tmdb/languages";

export async function GET() {
  try {
    return NextResponse.json({ languages: await getTmdbLanguages() }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.statusCode });
    }
    logger.error("Could not load TMDB languages", { category: "LANGUAGE_LIST_FAILED" });
    return NextResponse.json({ error: { message: "Movie languages are temporarily unavailable." } }, { status: 502 });
  }
}
