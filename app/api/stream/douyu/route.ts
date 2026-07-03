import { NextResponse } from "next/server";
import { getRealLive_Douyu } from "@/lib/reallive/douyu/reallive";
import type { IQnType, IStreamType } from "@/types";

export async function POST(request: Request) {
  try {
    const { rid, qn, type } = (await request.json()) as {
      rid: string;
      qn?: IQnType;
      type?: IStreamType;
    };
    const stream = await getRealLive_Douyu(rid, qn || "原画", type || "flv");
    return NextResponse.json({ stream });
  } catch {
    return NextResponse.json({ stream: "" }, { status: 500 });
  }
}
