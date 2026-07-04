import {
  apiGetBilibiliRealRid,
  apiGetDouyuRealRid,
} from "@/apis";
import { detectPlatform, getLastField, isRid, parseUrlParams } from "@/lib/utils";

/** 从直播间 URL 解析归一化房间号（与视频 rid 对齐，用于弹幕独立模式匹配） */
export async function resolveRoomKey(url: string): Promise<string> {
  const platform = detectPlatform(url);

  if (platform === "direct" || platform === "unknown") {
    return "";
  }

  let rid = getLastField(url);
  if (!isRid(rid)) {
    const queryObj = parseUrlParams(url);
    if (queryObj.rid) rid = queryObj.rid;
  }

  if (platform === "douyu") {
    return String(await apiGetDouyuRealRid(rid));
  }
  if (platform === "bilibili") {
    return String(await apiGetBilibiliRealRid(rid));
  }
  return rid;
}
