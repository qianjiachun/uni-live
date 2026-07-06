"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowsClockwise,
  ArrowsSplit,
  Copy,
  Eye,
  EyeSlash,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import type { DanmakuDisplayMode, GridLayoutState, IVideo } from "@/types";
import type { MergeDirection } from "@/features/grid-layout/grid-utils";
import {
  getMergeHandlesForSlot,
  getMergeableNeighbors,
  isMergedSlot,
  mergeSlots,
  moveVideoToSlot,
  slotRect,
  splitSlot,
} from "@/features/grid-layout/grid-utils";
import {
  DanmakuLayer,
  type DanmakuLayerHandle,
} from "@/features/danmaku/DanmakuLayer";
import { VideoTile } from "@/features/free-layout/VideoTile";

interface GridLayoutCanvasProps {
  videos: IVideo[];
  grid: GridLayoutState;
  onGridChange: (grid: GridLayoutState) => void;
  danmakuDisplayMode?: DanmakuDisplayMode;
  danmakuOpacity?: number;
  danmakuDensity?: number;
  danmakuSpeed?: number;
  onVideoDanmakuRef?: (videoId: string, handle: DanmakuLayerHandle | null) => void;
  onRefresh: (id: string, options?: { force?: boolean }) => void;
  onToggleVisible: (id: string) => void;
  onRemove: (id: string) => void;
  onCopyStream: (id: string) => void;
  onOpenSettings: () => void;
}

const SLOT_TRANSITION =
  "left 0.38s cubic-bezier(0.4, 0, 0.2, 1), top 0.38s cubic-bezier(0.4, 0, 0.2, 1), width 0.38s cubic-bezier(0.4, 0, 0.2, 1), height 0.38s cubic-bezier(0.4, 0, 0.2, 1)";

const DRAG_THRESHOLD_PX = 8;

const MERGE_LABELS: Record<MergeDirection, string> = {
  top: "上",
  right: "右",
  bottom: "下",
  left: "左",
};

const MERGE_ICONS: Record<MergeDirection, typeof ArrowUp> = {
  top: ArrowUp,
  right: ArrowRight,
  bottom: ArrowDown,
  left: ArrowLeft,
};

export function GridLayoutCanvas({
  videos,
  grid,
  onGridChange,
  danmakuDisplayMode = "independent",
  danmakuOpacity = 90,
  danmakuDensity = 20,
  danmakuSpeed = 120,
  onVideoDanmakuRef,
  onRefresh,
  onToggleVisible,
  onRemove,
  onCopyStream,
  onOpenSettings,
}: GridLayoutCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropTargetRef = useRef<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [dragSlotId, setDragSlotId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const pointerState = useRef<{
    slotId: string;
    startX: number;
    startY: number;
    pointerId: number;
    dragging: boolean;
  } | null>(null);

  const videoMap = new Map(videos.map((v) => [v.id, v]));
  const danmakuIndependent = danmakuDisplayMode === "independent";

  const selectedSlot = selectedSlotId
    ? grid.slots.find((s) => s.id === selectedSlotId)
    : undefined;

  const mergeableNeighbors = selectedSlotId
    ? getMergeableNeighbors(grid.slots, selectedSlotId)
    : [];

  const mergeHandles = selectedSlot
    ? getMergeHandlesForSlot(
        selectedSlot,
        mergeableNeighbors,
        grid.rows,
        grid.cols,
        grid.gap
      )
    : [];

  useEffect(() => {
    dropTargetRef.current = dropTargetId;
  }, [dropTargetId]);

  const handleMergeWith = useCallback(
    (neighborId: string) => {
      if (!selectedSlotId) return;
      onGridChange(mergeSlots(grid, selectedSlotId, neighborId));
      setSelectedSlotId(null);
    },
    [grid, onGridChange, selectedSlotId]
  );

  const handleSplit = useCallback(() => {
    if (!selectedSlotId) return;
    onGridChange(splitSlot(grid, selectedSlotId));
    setSelectedSlotId(null);
  }, [grid, onGridChange, selectedSlotId]);

  const findSlotAtPoint = useCallback(
    (px: number, py: number) => {
      for (const slot of grid.slots) {
        const r = slotRect(slot, grid.rows, grid.cols, grid.gap);
        if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
          return slot.id;
        }
      }
      return null;
    },
    [grid]
  );

  const handleOverlayPointerDown = useCallback(
    (e: React.PointerEvent, slotId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const slot = grid.slots.find((s) => s.id === slotId);
      if (!slot?.videoId) {
        setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
        return;
      }

      pointerState.current = {
        slotId,
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        dragging: false,
      };
    },
    [grid.slots]
  );

  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = pointerState.current;
      if (!state || state.pointerId !== e.pointerId) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const dist = Math.hypot(dx, dy);

      if (!state.dragging && dist > DRAG_THRESHOLD_PX) {
        state.dragging = true;
        setDragSlotId(state.slotId);
        setSelectedSlotId(null);
        containerRef.current?.setPointerCapture(e.pointerId);
      }

      if (!state.dragging) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      const found = findSlotAtPoint(px, py);
      const next = found !== state.slotId ? found : null;
      dropTargetRef.current = next;
      setDropTargetId(next);
    },
    [findSlotAtPoint]
  );

  const handleContainerPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const state = pointerState.current;
      if (!state || state.pointerId !== e.pointerId) return;

      if (state.dragging) {
        const target = dropTargetRef.current;
        if (target) {
          onGridChange(moveVideoToSlot(grid, state.slotId, target));
        }
        setDragSlotId(null);
        setDropTargetId(null);
        dropTargetRef.current = null;
        if (containerRef.current?.hasPointerCapture(e.pointerId)) {
          containerRef.current.releasePointerCapture(e.pointerId);
        }
      } else {
        setSelectedSlotId((prev) =>
          prev === state.slotId ? null : state.slotId
        );
      }

      pointerState.current = null;
    },
    [grid, onGridChange]
  );

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.target === containerRef.current) {
      setSelectedSlotId(null);
    }
  }, []);

  const noopDrag = useCallback(() => {}, []);
  const noopResize = useCallback(() => {}, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-black"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerCancel={handleContainerPointerUp}
    >
      <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
        {Array.from({ length: grid.rows - 1 }).map((_, i) => {
          const y =
            ((i + 1) / grid.rows) * 100 -
            (grid.gap * (grid.rows - 1)) / grid.rows / 2;
          return (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-white/10"
              style={{ top: `${y}%` }}
            />
          );
        })}
        {Array.from({ length: grid.cols - 1 }).map((_, i) => {
          const x =
            ((i + 1) / grid.cols) * 100 -
            (grid.gap * (grid.cols - 1)) / grid.cols / 2;
          return (
            <div
              key={`v-${i}`}
              className="absolute bottom-0 top-0 w-px bg-white/10"
              style={{ left: `${x}%` }}
            />
          );
        })}
      </div>

      {grid.slots.map((slot) => {
        const rect = slotRect(slot, grid.rows, grid.cols, grid.gap);
        const video = slot.videoId ? videoMap.get(slot.videoId) : undefined;
        const isSelected = selectedSlotId === slot.id;
        const isDragging = dragSlotId === slot.id;
        const isDropTarget = dropTargetId === slot.id;
        const isMergeNeighbor = mergeableNeighbors.some((n) => n.id === slot.id);

        return (
          <div
            key={slot.id}
            className={clsx(
              "group absolute z-10 overflow-visible rounded-md",
              isDragging && "z-30 scale-[1.02] opacity-80 shadow-2xl ring-2 ring-accent",
              isDropTarget && "z-20 ring-2 ring-accent/80 ring-offset-1 ring-offset-black",
              isSelected && "z-20 ring-2 ring-accent",
              isMergeNeighbor && "ring-2 ring-accent/40 ring-dashed"
            )}
            style={{
              left: `${rect.x}%`,
              top: `${rect.y}%`,
              width: `${rect.w}%`,
              height: `${rect.h}%`,
              transition: SLOT_TRANSITION,
            }}
          >
            <div className="relative h-full w-full min-h-0 overflow-hidden rounded-md">
              {video ? (
                <>
                  <VideoTile
                    video={video}
                    isActive={isDragging || isSelected}
                    layoutMode="grid"
                    showToolbar={false}
                    onPointerDownDrag={noopDrag}
                    onPointerDownResize={noopResize}
                    onRefresh={() => onRefresh(video.id, { force: true })}
                    onToggleVisible={() => onToggleVisible(video.id)}
                    onRemove={() => onRemove(video.id)}
                    onCopyStream={() => onCopyStream(video.id)}
                  />
                  {danmakuIndependent ? (
                    <div className="pointer-events-none absolute inset-0 z-[50] overflow-hidden rounded-md">
                      <DanmakuLayer
                        ref={(handle) => onVideoDanmakuRef?.(video.id, handle)}
                        opacity={danmakuOpacity}
                        density={danmakuDensity}
                        speed={danmakuSpeed}
                        className="pointer-events-none absolute inset-0"
                      />
                    </div>
                  ) : null}

                  {/* 交互遮罩：拦截点击，避免暂停播放器 */}
                  <div
                    className={clsx(
                      "absolute inset-0 z-[25] touch-none",
                      isDragging ? "cursor-grabbing" : "cursor-pointer"
                    )}
                    aria-label="格子布局操作区"
                    onPointerDown={(e) => handleOverlayPointerDown(e, slot.id)}
                  />

                  {/* 悬停工具栏 */}
                  <div
                    className={clsx(
                      "absolute inset-x-0 top-0 z-[35] flex items-center gap-0.5 bg-gradient-to-b from-black/85 to-transparent p-1.5 transition-opacity duration-200",
                      isSelected
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate px-1 text-[10px] text-white/90">
                      {video.url}
                    </span>
                    <SlotIconButton
                      label="刷新"
                      onClick={() => onRefresh(video.id, { force: true })}
                    >
                      <ArrowsClockwise size={14} />
                    </SlotIconButton>
                    <SlotIconButton
                      label={video.layout.visible ? "隐藏" : "显示"}
                      onClick={() => onToggleVisible(video.id)}
                    >
                      {video.layout.visible ? (
                        <Eye size={14} />
                      ) : (
                        <EyeSlash size={14} />
                      )}
                    </SlotIconButton>
                    <SlotIconButton
                      label="复制流"
                      onClick={() => onCopyStream(video.id)}
                    >
                      <Copy size={14} />
                    </SlotIconButton>
                    <SlotIconButton
                      label="删除"
                      onClick={() => onRemove(video.id)}
                      danger
                    >
                      <Trash size={14} />
                    </SlotIconButton>
                  </div>

                  {/* 选中时的底部操作栏 */}
                  {isSelected ? (
                    <div className="absolute inset-x-1 bottom-1 z-[40] flex flex-wrap items-center justify-center gap-1 rounded-lg border border-border/60 bg-surface/95 px-1.5 py-1 shadow-lg backdrop-blur-md">
                      <SlotActionButton
                        label="取消选中"
                        onClick={() => setSelectedSlotId(null)}
                      >
                        <X size={14} />
                        取消
                      </SlotActionButton>
                      {mergeHandles.map((handle) => {
                        const Icon = MERGE_ICONS[handle.direction];
                        return (
                          <SlotActionButton
                            key={handle.direction}
                            label={`向${MERGE_LABELS[handle.direction]}合并`}
                            onClick={() => handleMergeWith(handle.neighborId)}
                          >
                            <Icon size={14} />
                            {MERGE_LABELS[handle.direction]}
                          </SlotActionButton>
                        );
                      })}
                      {selectedSlot && isMergedSlot(selectedSlot) ? (
                        <SlotActionButton label="拆分格子" onClick={handleSplit}>
                          <ArrowsSplit size={14} />
                          拆分
                        </SlotActionButton>
                      ) : null}
                    </div>
                  ) : !dragSlotId ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] bg-gradient-to-t from-black/70 to-transparent px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <p className="truncate text-center text-[9px] text-white/80">
                        点击选中 · 拖动交换
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSettings();
                  }}
                  className={clsx(
                    "flex h-full w-full flex-col items-center justify-center gap-1",
                    "border border-dashed border-white/10 bg-white/[0.02]",
                    "text-muted transition-all duration-200",
                    "hover:border-accent/40 hover:bg-accent/5 hover:text-foreground",
                    "group-hover:border-white/20 group-hover:bg-white/[0.04]",
                    isSelected && "border-accent/60 bg-accent/10"
                  )}
                >
                  <Plus
                    size={20}
                    weight="bold"
                    className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                  <span className="text-[10px] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    添加直播
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SlotIconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        danger
          ? "text-red-300 hover:bg-red-500/20"
          : "text-white/80 hover:bg-white/15 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function SlotActionButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-8 items-center gap-1 rounded-md border border-border/50 bg-surface-elevated/80 px-2 text-[10px] text-foreground transition-colors hover:border-accent/50 hover:bg-accent/15"
    >
      {children}
    </button>
  );
}
