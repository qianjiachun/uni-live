"use client";

import {
  CaretDown,
  DotsThreeOutline,
  GearSix,
  ShareNetwork,
  SquaresFour,
} from "@phosphor-icons/react";
import clsx from "clsx";
import type { LayoutMode } from "@/types";

interface ControlDockProps {
  visible: boolean;
  onToggleVisible: () => void;
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
};

export function ControlDock({
  visible,
  onToggleVisible,
  onOpenSettings,
  onShare,
  layoutMode,
  videoCount,
  danmakuCount,
}: ControlDockProps) {
  if (!visible) {
    return (
      <button
        type="button"
        aria-label="显示工具栏"
        title="显示工具栏"
        onClick={onToggleVisible}
        className={clsx(
          "fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2",
          "rounded-full border border-border/50 bg-surface/80 px-4 py-2",
          "text-sm text-muted shadow-lg backdrop-blur-md",
          "transition-all duration-200 hover:bg-surface hover:text-foreground",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        )}
      >
        <DotsThreeOutline size={18} weight="fill" />
        <span>工具栏</span>
      </button>
    );
  }

  return (
    <div
      className={clsx(
        "fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1",
        "rounded-2xl border border-border/60 bg-surface/95 px-2 py-2",
        "shadow-2xl backdrop-blur-md transition-all duration-200"
      )}
    >
      <DockButton label="设置" onClick={onOpenSettings}>
        <GearSix size={22} />
      </DockButton>
      <DockButton label="分享" onClick={onShare}>
        <ShareNetwork size={22} />
      </DockButton>
      <div className="mx-1 hidden h-6 w-px bg-border/60 sm:block" aria-hidden />
      <div className="hidden items-center gap-2 px-2 text-xs text-muted sm:flex">
        <SquaresFour size={16} aria-hidden />
        <span>{modeLabels[layoutMode]}</span>
        <span aria-hidden>·</span>
        <span>{videoCount} 视频</span>
        <span aria-hidden>·</span>
        <span>{danmakuCount} 弹幕</span>
      </div>
      <div className="mx-1 h-6 w-px bg-border/60" aria-hidden />
      <DockButton label="隐藏工具栏" onClick={onToggleVisible}>
        <CaretDown size={22} />
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
        "flex h-11 w-11 items-center justify-center rounded-xl text-foreground",
        "transition-colors duration-150 hover:bg-white/10",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      )}
    >
      {children}
    </button>
  );
}
