import type { FC } from "react";
import { useRef } from "react";
import { useEffect } from "react";

// const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
interface IProps {
    style?: React.CSSProperties;
    // 视频地址
    url: string;
    // 直播流
    src: string;
    // flex里的order 和 z-index，控制视频的显示顺序
    order: number;
}

const VideoItem: FC<IProps> = (props) => {
    // const videoRef = useRef<HTMLVideoElement>(null);
    // let flvPlayer: any = null;
    // useEffect(() => {
    //     if (!window.flvjs.isSupported() || props.src === "") return;
    //     // if (flvPlayer) {
    //     //     flvPlayer.unload();
    //     //     flvPlayer.destory();
    //     // }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     flvPlayer = window.flvjs.createPlayer({
    //         type: 'flv',
    //         url: props.src
    //     },{fixAudioTimestampGap: false});
        
    //     flvPlayer.attachMediaElement(videoRef.current);
    //     flvPlayer.load();
    //     flvPlayer.play();
    //     return () => {
    //         flvPlayer.unload();
    //         if (flvPlayer.destory) {
    //             flvPlayer.destory();
    //         }
    //     }
    // }, [props.src])
    const videoRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        window.renderReactPlayer(videoRef.current, {url: props.src, playing: true, muted: true, width: "100%", height: "100%", controls: true});
    }, [props.src])

    return (
        <div style={{
            order: props.order,
            zIndex: props.order,
            ...props.style
        }}>
            {/* <ReactPlayer
                width={"100%"}
                height={"100%"}
                url={props.src}
                controls={true}
                playing={true}
                muted
            ></ReactPlayer> */}
            <div ref={videoRef} className="w-full h-full"></div>
            {/* <video muted autoPlay={true} ref={videoRef} className="w-full h-full" src={props.src} controls={true} ></video> */}
        </div>
    )
}

export default VideoItem;