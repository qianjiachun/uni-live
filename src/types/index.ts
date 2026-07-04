export type IQnType = "原画" | "蓝光" | "超清" | "高清" | "流畅";
export type IStreamType = "hls" | "flv";
export type LayoutMode = "overlap" | "equal" | "free";
/** 弹幕显示：重合=全局一层；独立=按房间号飘在对应直播画面内 */
export type DanmakuDisplayMode = "merged" | "independent";
export type Platform = "douyu" | "bilibili" | "huya" | "direct" | "unknown";
export type VideoStatus = "idle" | "loading" | "playing" | "error";

export interface VideoLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  visible: boolean;
}

export interface IVideo {
  id: string;
  order: number;
  url: string;
  rid: string;
  stream: string;
  qnName: IQnType;
  streamType: IStreamType;
  platform: Platform;
  playbackKey: number;
  layout: VideoLayout;
  status: VideoStatus;
  errorMessage?: string;
  isRefreshing?: boolean;
}

export interface IVideoOrder {
  id: string;
  url: string;
  qnName: IQnType;
  layout?: VideoLayout;
}

export interface IDanmaku {
  id: string;
  url: string;
  /** 归一化房间号，用于独立模式匹配直播画面 */
  rid: string;
  ws: { close?: () => void } | null;
}

export interface IHuyaChannelInfo {
  channelId: string | number;
  subChannelId: string | number;
}

export interface SharePayload {
  video: IVideoOrder[];
  danmaku: { url: string }[];
  layoutMode: LayoutMode;
  lineCount: number;
}

declare global {
  interface Window {
    HuYaListener: (
      tid: string | number,
      sid: string | number,
      msgHandler: (data: { sContent: string; tBulletFormat: { iFontColor: number } }) => void
    ) => { close?: () => void };
  }
}
