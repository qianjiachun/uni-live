import { NextResponse } from "next/server";
import { getRealRid_Douyu } from "@/lib/reallive/douyu/realrid";

export async function POST(request: Request) {
  try {
    const { rid } = (await request.json()) as { rid: string };
    const realRid = await getRealRid_Douyu(rid);
    return NextResponse.json({ rid: realRid });
  } catch {
    return NextResponse.json({ rid: "" }, { status: 500 });
  }
}
