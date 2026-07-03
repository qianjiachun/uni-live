"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface PlayerAdapterProps {
  src: string;
  playbackKey: number;
  onError?: () => void;
}

export function PlayerAdapter({ src, playbackKey, onError }: PlayerAdapterProps) {
  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  if (!src) return null;

  return (
    <ReactPlayer
      key={playbackKey}
      url={src}
      playing
      muted
      controls
      width="100%"
      height="100%"
      onError={handleError}
      config={{
        file: {
          forceHLS: src.includes(".m3u8"),
          forceFLV: src.includes(".flv") || (!src.includes(".m3u8") && !src.includes(".mp4")),
        },
      }}
    />
  );
}
