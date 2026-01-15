import { NextResponse } from "next/server";
import { formatISO } from "date-fns";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: formatISO(new Date()),
  });
}
