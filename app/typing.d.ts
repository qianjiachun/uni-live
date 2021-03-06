declare interface Window {
    ub98484234: any,
    flvjs: any,
    renderReactPlayer: any;
    UAParser: any;
    HuYaListener: any;
}

declare class STT {
    public escape(v: string): string
    public unescape(v: string): string
    public deserialize(v: string): string
}

declare class Ex_WebSocket_UnLogin {
    constructor(
        rid: string,
        msgHandler: (msg: string) => void,
        closeHandler?: () => void,
    )
    public close(): void
}

// declare function HuYaListener(tid: string | number, sid: string | number, msgHandler: (data: any) => void): any;

interface IVideo {
    id: string;
    // order
    order: number;
    // 视频链接
    url: string;
    // rid
    rid: string;
    // 视频直播流地址
    stream: string;
}

interface IVideoOrder {
    id: string;
    url: string;
    qnName: string;
}

interface IDanmaku {
    id: string;
    url: string;
    ws: any;
}

type IShowType = "overlap" | "line" | "grid";

type IStreamType = "hls" | "flv";

type IQnType = "原画" | "蓝光" | "超清" | "高清" | "流畅";

interface IDouyuScript {
    rid: string;
    script: string;
}

interface IHuyaChannelInfo {
    channelId: string | number;
    subChannelId: string | number;
}