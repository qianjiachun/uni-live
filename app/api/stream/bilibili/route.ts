import { NextResponse } from "next/server";
import { getRealLive_Bilibili } from "@/lib/reallive/bilibili/reallive";
import type { IQnType, IStreamType } from "@/types";

export async function POST(request: Request) {
  try {
    const { rid, type, qn } = (await request.json()) as {
      rid: string;
      type?: IStreamType;
      qn?: IQnType;
    };
    const stream = await getRealLive_Bilibili(rid, qn || "原画", type || "flv");
    return NextResponse.json({ stream });
  } catch {
    return NextResponse.json({ stream: "" }, { status: 500 });
  }
}
