import type { FC } from "react";

interface IProps {
    // 视频地址(直播流)
    src: string;
    // flex里的order 和 z-index，控制视频的显示顺序
    order: number;
}

const VideoItem: FC<IProps> = (props) => {
    return (
        <div style={{
            order: props.order,
            zIndex: props.order,
        }}>
            <video className="w-full h-full" src={props.src} controls={true} ></video>
        </div>
    )
}

export default VideoItem;