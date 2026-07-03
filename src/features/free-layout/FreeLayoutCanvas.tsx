"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import type { IVideo, LayoutMode } from "@/types";
import {
  applyDrag,
  applyResize,
  type ResizeHandle,
} from "@/features/free-layout/layout-utils";
import { VideoTile } from "@/features/free-layout/VideoTile";

interface FreeLayoutCanvasProps {
  videos: IVideo[];
  layoutMode: LayoutMode;
  lineCount: number;
  onLayoutChange: (id: string, layout: IVideo["layout"]) => void;
  onRefresh: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onBringToFront: (id: string) => void;
  onRemove: (id: string) => void;
  onCopyStream: (id: string) => void;
}

export function FreeLayoutCanvas({
  videos,
  layoutMode,
  lineCount,
  onLayoutChange,
  onRefresh,
  onToggleVisible,
  onBringToFront,
  onRemove,
  onCopyStream,
}: FreeLayoutCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    id: string;
    mode: "drag" | "resize";
    handle?: ResizeHandle;
    startX: number;
    startY: number;
    origin: IVideo["layout"];
  } | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  const visibleVideos = videos.filter((v) => v.layout.visible);
  const overlapVideoId =
    layoutMode === "overlap"
      ? visibleVideos.reduce<string | null>((best, v) => {
          if (!best) return v.id;
          const bestOrder = videos.find((x) => x.id === best)?.order ?? -1;
          return v.order > bestOrder ? v.id : best;
        }, null)
      : null;

  const handlePointerDown = useCallback(
    (
      e: React.PointerEvent,
      id: string,
      mode: "drag" | "resize",
      handle?: ResizeHandle
    ) => {
      if (layoutMode !== "free") return;
      e.preventDefault();
      e.stopPropagation();
      const video = videos.find((v) => v.id === id);
      if (!video) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = {
        id,
        mode,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origin: { ...video.layout },
      };
      setActiveId(id);
      onBringToFront(id);
    },
    [layoutMode, onBringToFront, videos]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = dragState.current;
      const container = containerRef.current;
      if (!state || !container) return;

      const rect = container.getBoundingClientRect();
      const dx = ((e.clientX - state.startX) / rect.width) * 100;
      const dy = ((e.clientY - state.startY) / rect.height) * 100;

      const next =
        state.mode === "drag"
          ? applyDrag(state.origin, dx, dy)
          : applyResize(state.origin, state.handle ?? "se", dx, dy);

      onLayoutChange(state.id, next);
    },
    [onLayoutChange]
  );

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
    setActiveId(null);
  }, []);

  const getTileStyle = (video: IVideo): React.CSSProperties => {
    if (layoutMode === "overlap") {
      const isTop = video.id === overlapVideoId;
      return {
        position: "absolute",
        inset: 0,
        display: isTop ? "block" : "none",
        zIndex: video.layout.zIndex,
      };
    }

    if (layoutMode === "equal") {
      const widthPercent = 100 / Math.max(lineCount, 1);
      return {
        position: "relative",
        flex: `0 0 ${widthPercent}%`,
        height: "100%",
        zIndex: video.layout.zIndex,
      };
    }

    return {
      position: "absolute",
      left: `${video.layout.x}%`,
      top: `${video.layout.y}%`,
      width: `${video.layout.w}%`,
      height: `${video.layout.h}%`,
      zIndex: video.layout.zIndex,
    };
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative h-full w-full overflow-hidden bg-black",
        layoutMode === "equal" && "flex flex-wrap"
      )}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {videos.map((video) => (
        <VideoTile
          key={video.id}
          video={video}
          style={getTileStyle(video)}
          isActive={activeId === video.id}
          layoutMode={layoutMode}
          onPointerDownDrag={(e) => handlePointerDown(e, video.id, "drag")}
          onPointerDownResize={(e, handle) =>
            handlePointerDown(e, video.id, "resize", handle)
          }
          onRefresh={() => onRefresh(video.id)}
          onToggleVisible={() => onToggleVisible(video.id)}
          onRemove={() => onRemove(video.id)}
          onCopyStream={() => onCopyStream(video.id)}
        />
      ))}
    </div>
  );
}
