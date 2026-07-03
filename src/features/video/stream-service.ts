import type { IQnType, IStreamType, Platform } from "@/types";
import {
  apiGetBilibiliStream,
  apiGetDouyuRealRid,
  apiGetDouyuStream,
  apiGetHuyaStream,
} from "@/apis";
import { detectPlatform, getLastField, isRid, parseUrlParams } from "@/lib/utils";

export async function resolveStreamUrl(
  url: string,
  qnName: IQnType,
  streamType: IStreamType
): Promise<{ stream: string; rid: string; platform: Platform }> {
  const platform = detectPlatform(url);

  if (url.length > 150) {
    return { stream: url, rid: "", platform: "direct" };
  }

  let rid = getLastField(url);
  if (!isRid(rid)) {
    const queryObj = parseUrlParams(url);
    if (queryObj.rid) rid = queryObj.rid;
  }

  let stream = "";

  if (platform === "douyu") {
    const realRid = await apiGetDouyuRealRid(rid);
    rid = realRid;
    stream = await apiGetDouyuStream(rid, qnName, streamType);
  } else if (platform === "bilibili") {
    stream = await apiGetBilibiliStream(rid, qnName, streamType);
  } else if (platform === "huya") {
    stream = await apiGetHuyaStream(rid);
  } else {
    stream = url;
  }

  return { stream, rid, platform };
}

export function getStreamErrorMessage(stream: string, platform: Platform): string | null {
  if (!stream || stream.length < 10) {
    if (platform === "douyu" || platform === "bilibili") {
      return "获取直播流失败，可能未开播或清晰度不可用";
    }
    if (platform === "huya") {
      return "获取虎牙直播流失败，请确认房间号正确";
    }
    return "无法解析直播流地址";
  }
  return null;
}
