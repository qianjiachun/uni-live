import axios from "axios";
import type { IHuyaChannelInfo, IQnType, IStreamType } from "@/types";

export function apiGetDouyuRealRid(rid: string): Promise<string> {
  return axios
    .post("/api/rid/douyu", { rid })
    .then((ret) => ret.data.rid as string);
}

export function apiGetDouyuStream(
  rid: string,
  qn: IQnType,
  type: IStreamType
): Promise<string> {
  return axios
    .post("/api/stream/douyu", { rid, qn: qn || "原画", type: type || "flv" })
    .then((ret) => ret.data.stream as string);
}

export function apiGetHuyaStream(rid: string): Promise<string> {
  return axios
    .post("/api/stream/huya", { rid })
    .then((ret) => ret.data.stream as string);
}

export function apiGetBilibiliStream(
  rid: string,
  qn: IQnType,
  type: IStreamType
): Promise<string> {
  return axios
    .post("/api/stream/bilibili", {
      rid,
      type: type || "flv",
      qn: qn || "原画",
    })
    .then((ret) => ret.data.stream as string);
}

export function apiGetBilibiliRealRid(rid: string): Promise<string> {
  return axios
    .post("/api/rid/bilibili", { rid })
    .then((ret) => ret.data.rid as string);
}

export function apiGetHuyaChannelInfo(rid: string): Promise<IHuyaChannelInfo> {
  return axios
    .post("/api/rid/huyaChannelInfo", { rid })
    .then((ret) => ret.data as IHuyaChannelInfo);
}
