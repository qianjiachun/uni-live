import { NextResponse } from "next/server";
import { getRealLive_Huya } from "@/lib/reallive/huya/reallive";

export async function POST(request: Request) {
  try {
    const { rid } = (await request.json()) as { rid: string };
    const stream = await getRealLive_Huya(rid);
    return NextResponse.json({ stream });
  } catch {
    return NextResponse.json({ stream: "" }, { status: 500 });
  }
}
