import { NextResponse } from "next/server";
import { getChannelInfo_Huya } from "@/lib/reallive/huya/channel";

export async function POST(request: Request) {
  try {
    const { rid } = (await request.json()) as { rid: string };
    const { channelId, subChannelId } = await getChannelInfo_Huya(rid);
    return NextResponse.json({ channelId, subChannelId });
  } catch {
    return NextResponse.json({ channelId: "", subChannelId: "" }, { status: 500 });
  }
}
