"use client";

import clsx from "clsx";
import {
  ArrowsClockwise,
  Copy,
  Eye,
  EyeSlash,
  Trash,
  DotsSixVertical,
} from "@phosphor-icons/react";
import type { IVideo, LayoutMode } from "@/types";
import { PlayerAdapter } from "@/features/video/PlayerAdapter";
import type { ResizeHandle } from "@/features/free-layout/layout-utils";

interface VideoTileProps {
  video: IVideo;
  isActive: boolean;
  layoutMode: LayoutMode;
  onPointerDownDrag: (e: React.PointerEvent) => void;
  onPointerDownResize: (e: React.PointerEvent, handle: ResizeHandle) => void;
  onRefresh: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  onCopyStream: () => void;
}

const RESIZE_HANDLES: { handle: ResizeHandle; className: string }[] = [
  { handle: "nw", className: "left-0 top-0 cursor-nw-resize" },
  { handle: "ne", className: "right-0 top-0 cursor-ne-resize" },
  { handle: "sw", className: "left-0 bottom-0 cursor-sw-resize" },
  { handle: "se", className: "right-0 bottom-0 cursor-se-resize" },
  { handle: "n", className: "left-1/2 top-0 -translate-x-1/2 cursor-n-resize" },
  { handle: "s", className: "left-1/2 bottom-0 -translate-x-1/2 cursor-s-resize" },
  { handle: "w", className: "left-0 top-1/2 -translate-y-1/2 cursor-w-resize" },
  { handle: "e", className: "right-0 top-1/2 -translate-y-1/2 cursor-e-resize" },
];

export function VideoTile({
  video,
  isActive,
  layoutMode,
  onPointerDownDrag,
  onPointerDownResize,
  onRefresh,
  onToggleVisible,
  onRemove,
  onCopyStream,
}: VideoTileProps) {
  return (
    <div
      className={clsx(
        "group relative h-full w-full overflow-hidden rounded-lg border border-border/40 bg-surface shadow-lg transition-shadow",
        isActive && "ring-2 ring-accent/70"
      )}
    >
      <div
        className={clsx(
          "absolute inset-x-0 top-0 z-20 flex items-center gap-1 bg-gradient-to-b from-black/80 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100",
          layoutMode === "free" && "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={layoutMode === "free" ? onPointerDownDrag : undefined}
      >
        {layoutMode === "free" && (
          <DotsSixVertical
            size={18}
            className="shrink-0 text-muted"
            aria-hidden
          />
        )}
        <span className="min-w-0 flex-1 truncate text-xs text-foreground">
          {video.url}
        </span>
        <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] text-muted">
          {video.qnName}
        </span>
        <IconButton
          label="刷新直播流"
          onClick={onRefresh}
          disabled={video.isRefreshing}
        >
          <ArrowsClockwise
            size={18}
            className={clsx(video.isRefreshing && "animate-spin")}
          />
        </IconButton>
        <IconButton label={video.layout.visible ? "隐藏" : "显示"} onClick={onToggleVisible}>
          {video.layout.visible ? <Eye size={18} /> : <EyeSlash size={18} />}
        </IconButton>
        <IconButton label="复制流地址" onClick={onCopyStream}>
          <Copy size={18} />
        </IconButton>
        <IconButton label="删除" onClick={onRemove} variant="danger">
          <Trash size={18} />
        </IconButton>
      </div>

      <div className="relative h-full w-full">
        {video.stream ? (
          <PlayerAdapter
            src={video.stream}
            playbackKey={video.playbackKey}
            onError={onRefresh}
          />
        ) : null}

        {video.status === "loading" || video.isRefreshing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <span className="text-xs text-muted">
                {video.isRefreshing ? "正在刷新..." : "加载中..."}
              </span>
            </div>
          </div>
        ) : null}

        {video.status === "error" && !video.isRefreshing ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 p-4 text-center">
            <p className="text-sm text-red-300">{video.errorMessage}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-md bg-accent px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90"
            >
              重新获取
            </button>
          </div>
        ) : null}
      </div>

      {layoutMode === "free" &&
        RESIZE_HANDLES.map(({ handle, className }) => (
          <button
            key={handle}
            type="button"
            aria-label={`调整大小 ${handle}`}
            className={clsx(
              "absolute z-30 h-3 w-3 rounded-sm bg-accent/80 opacity-0 transition-opacity group-hover:opacity-100",
              className
            )}
            onPointerDown={(e) => onPointerDownResize(e, handle)}
          />
        ))}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        variant === "danger"
          ? "text-red-300 hover:bg-red-500/20"
          : "text-foreground hover:bg-white/10",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children}
    </button>
  );
}
