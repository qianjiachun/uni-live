declare interface Window {
    ub98484234: any
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

interface IVideo {
    // 视频链接
    src: string;
    // 视频直播流地址
    stream: string;
}