"use client";

import {
  CaretRight,
  DotsThreeOutline,
  GearSix,
  ShareNetwork,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import clsx from "clsx";
import type { LayoutMode } from "@/types";

export type DockDisplayState = "expanded" | "collapsed";

interface ControlDockProps {
  displayState: DockDisplayState;
  onExpand: () => void;
  onCollapse: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
  onShare: () => void;
  layoutMode: LayoutMode;
  videoCount: number;
  danmakuCount: number;
}

const modeLabels: Record<LayoutMode, string> = {
  overlap: "重叠",
  equal: "均分",
  free: "自由布局",
  grid: "网格",
};

const dockShellClass = clsx(
  "fixed right-2 top-1/2 z-50 -translate-y-1/2",
  "rounded-xl border border-border/60 bg-surface/95",
  "shadow-xl backdrop-blur-md transition-all duration-200"
);

export function ControlDock({
  displayState,
  onExpand,
  onCollapse,
  onClose,
  onOpenSettings,
  onShare,
  layoutMode,
  videoCount,
  danmakuCount,
}: ControlDockProps) {
  if (displayState === "collapsed") {
    return (
      <div
        role="toolbar"
        aria-label="直播控制"
        className={clsx(dockShellClass, "w-fit px-1 py-1")}
      >
        <div className="relative w-fit">
          <DockButton label="展开工具栏" onClick={onExpand}>
            <DotsThreeOutline size={16} weight="fill" />
          </DockButton>

          <button
            type="button"
            aria-label="关闭工具栏"
            title="关闭工具栏"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={clsx(
              "absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center",
              "rounded-full border border-border/80 bg-surface-elevated text-muted shadow-md",
              "transition-colors duration-150",
              "hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-300",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            )}
          >
            <X size={10} weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="toolbar"
      aria-label="直播控制"
      className={clsx(
        dockShellClass,
        "flex w-fit flex-col items-center gap-0.5 px-1 py-1"
      )}
    >
      <DockButton label="设置" onClick={onOpenSettings}>
        <GearSix size={18} />
      </DockButton>
      <DockButton label="分享" onClick={onShare}>
        <ShareNetwork size={18} />
      </DockButton>

      <div className="my-0.5 h-px w-6 bg-border/60" aria-hidden />

      <div className="flex flex-col items-center gap-0.5 px-0.5 py-0.5 text-center text-[9px] leading-tight text-muted">
        <SquaresFour size={12} aria-hidden className="shrink-0" />
        <span>{modeLabels[layoutMode]}</span>
        <span>{videoCount} 视频</span>
        <span>{danmakuCount} 弹幕</span>
      </div>

      <div className="my-0.5 h-px w-6 bg-border/60" aria-hidden />

      <DockButton label="收起工具栏" onClick={onCollapse}>
        <CaretRight size={18} />
      </DockButton>
    </div>
  );
}

function DockButton({
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
      onClick={onClick}
      className={clsx(
        "flex h-9 w-9 items-center justify-center rounded-lg text-foreground",
        "transition-colors duration-150 hover:bg-white/10",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      )}
    >
      {children}
    </button>
  );
}
