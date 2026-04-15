import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let dbStatus = "ok";

  try {
    // Lightweight connectivity check — count users without loading data
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json(
    {
      status: "ok",
      db: dbStatus,
      version: process.env.npm_package_version ?? "unknown",
      timestamp: new Date().toISOString(),
    },
    { status: dbStatus === "ok" ? 200 : 503 }
  );
}