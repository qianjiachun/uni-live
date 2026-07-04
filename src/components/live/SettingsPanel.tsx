"use client";

import { useState } from "react";
import {
  ArrowsClockwise,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeSlash,
  Trash,
  X,
} from "@phosphor-icons/react";
import clsx from "clsx";
import type {
  DanmakuDisplayMode,
  IDanmaku,
  IQnType,
  IStreamType,
  IVideo,
  IVideoOrder,
  LayoutMode,
} from "@/types";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  lineCount: number;
  onLineCountChange: (count: number) => void;
  qnName: IQnType;
  onQnNameChange: (qn: IQnType) => void;
  onAddVideo: (url: string, qn?: IQnType) => Promise<void>;
  isAddingVideo: boolean;
  videos: IVideo[];
  videoOrderList: IVideoOrder[];
  onMoveVideoUp: (index: number) => void;
  onMoveVideoDown: (index: number) => void;
  onRemoveVideo: (id: string) => void;
  onRefreshVideo: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onCopyStream: (id: string) => void;
  danmakuList: IDanmaku[];
  onAddDanmaku: (url: string) => Promise<void>;
  isAddingDanmaku: boolean;
  onRemoveDanmaku: (id: string) => void;
  danmakuOpacity: number;
  onDanmakuOpacityChange: (v: number) => void;
  danmakuDensity: number;
  onDanmakuDensityChange: (v: number) => void;
  danmakuSpeed: number;
  onDanmakuSpeedChange: (v: number) => void;
  danmakuDisplayMode: DanmakuDisplayMode;
  onDanmakuDisplayModeChange: (mode: DanmakuDisplayMode) => void;
  streamType: IStreamType;
}

type Tab = "video" | "danmaku" | "help";

const QN_OPTIONS: IQnType[] = ["原画", "蓝光", "超清", "高清", "流畅"];

export function SettingsPanel({
  open,
  onClose,
  layoutMode,
  onLayoutModeChange,
  lineCount,
  onLineCountChange,
  qnName,
  onQnNameChange,
  onAddVideo,
  isAddingVideo,
  videos,
  videoOrderList,
  onMoveVideoUp,
  onMoveVideoDown,
  onRemoveVideo,
  onRefreshVideo,
  onToggleVisible,
  onCopyStream,
  danmakuList,
  onAddDanmaku,
  isAddingDanmaku,
  onRemoveDanmaku,
  danmakuOpacity,
  onDanmakuOpacityChange,
  danmakuDensity,
  onDanmakuDensityChange,
  danmakuSpeed,
  onDanmakuSpeedChange,
  danmakuDisplayMode,
  onDanmakuDisplayModeChange,
  streamType,
}: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [danmakuUrl, setDanmakuUrl] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="关闭设置"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="设置面板"
        className="relative flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-t-2xl border border-border bg-surface shadow-2xl md:rounded-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-lg">设置</h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex border-b border-border px-2">
          {(
            [
              ["video", "视频"],
              ["danmaku", "弹幕"],
              ["help", "帮助"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={clsx(
                "px-4 py-2.5 text-sm transition-colors",
                tab === key
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "video" && (
            <div className="space-y-4">
              <Field label="布局模式">
                <RadioGroup
                  value={layoutMode}
                  options={[
                    { value: "overlap", label: "重叠模式" },
                    { value: "equal", label: "均分模式" },
                    { value: "free", label: "自由布局" },
                  ]}
                  onChange={(v) => onLayoutModeChange(v as LayoutMode)}
                />
              </Field>

              <Field label="均分列数" hint="均分模式下每行视频数量">
                <input
                  type="number"
                  min={1}
                  max={6}
                  disabled={layoutMode === "overlap"}
                  value={lineCount}
                  onChange={(e) => onLineCountChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50"
                />
              </Field>

              <Field label="画质">
                <RadioGroup
                  value={qnName}
                  options={QN_OPTIONS.map((q) => ({ value: q, label: q }))}
                  onChange={(v) => onQnNameChange(v as IQnType)}
                />
              </Field>

              <Field label={`流类型（当前: ${streamType.toUpperCase()}）`}>
                <p className="text-xs text-muted">
                  iOS / macOS 自动使用 HLS，其他平台默认 FLV
                </p>
              </Field>

              <Field label="添加视频">
                <div className="flex gap-2">
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="斗鱼/B站/虎牙直播间或直播流地址"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-accent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && videoUrl.trim()) {
                        void onAddVideo(videoUrl, qnName).then(() =>
                          setVideoUrl("")
                        );
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isAddingVideo}
                    onClick={() =>
                      void onAddVideo(videoUrl, qnName).then(() => setVideoUrl(""))
                    }
                    className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {isAddingVideo ? "添加中..." : "添加"}
                  </button>
                </div>
              </Field>

              <div className="space-y-2">
                {videoOrderList.map((item, index) => {
                  const video = videos.find((v) => v.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface-elevated/50 p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs">{item.url}</p>
                        <p className="text-[10px] text-muted">{item.qnName}</p>
                      </div>
                      <RowButton
                        label="刷新"
                        onClick={() => onRefreshVideo(item.id)}
                      >
                        <ArrowsClockwise size={16} />
                      </RowButton>
                      <RowButton
                        label={video?.layout.visible ? "隐藏" : "显示"}
                        onClick={() => onToggleVisible(item.id)}
                      >
                        {video?.layout.visible ? (
                          <Eye size={16} />
                        ) : (
                          <EyeSlash size={16} />
                        )}
                      </RowButton>
                      <RowButton
                        label="复制流"
                        onClick={() => onCopyStream(item.id)}
                      >
                        <Copy size={16} />
                      </RowButton>
                      {index > 0 && (
                        <RowButton
                          label="上移"
                          onClick={() => onMoveVideoUp(index)}
                        >
                          <ArrowUp size={16} />
                        </RowButton>
                      )}
                      {index < videoOrderList.length - 1 && (
                        <RowButton
                          label="下移"
                          onClick={() => onMoveVideoDown(index)}
                        >
                          <ArrowDown size={16} />
                        </RowButton>
                      )}
                      <RowButton
                        label="删除"
                        onClick={() => onRemoveVideo(item.id)}
                        danger
                      >
                        <Trash size={16} />
                      </RowButton>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "danmaku" && (
            <div className="space-y-4">
              <Field
                label="显示模式"
                hint="独立模式按房间号将弹幕飘在对应直播画面内；找不到对应画面时飘在最外层"
              >
                <RadioGroup
                  value={danmakuDisplayMode}
                  options={[
                    { value: "merged", label: "重合" },
                    { value: "independent", label: "独立" },
                  ]}
                  onChange={(v) =>
                    onDanmakuDisplayModeChange(v as DanmakuDisplayMode)
                  }
                />
              </Field>
              <Field label={`不透明度 ${danmakuOpacity}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={danmakuOpacity}
                  onChange={(e) =>
                    onDanmakuOpacityChange(Number(e.target.value))
                  }
                  className="w-full accent-accent"
                />
              </Field>
              <Field label={`弹幕密度 ${danmakuDensity}`} hint="同轨道最小间距，越大越稀疏；过载时会自动丢弃旧弹幕">
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={danmakuDensity}
                  onChange={(e) =>
                    onDanmakuDensityChange(Number(e.target.value))
                  }
                  className="w-full accent-accent"
                />
              </Field>
              <Field
                label={`弹幕速度 ${danmakuSpeed}`}
                hint="数值越大飘屏越快（40–400）"
              >
                <input
                  type="range"
                  min={40}
                  max={400}
                  step={10}
                  value={danmakuSpeed}
                  onChange={(e) =>
                    onDanmakuSpeedChange(Number(e.target.value))
                  }
                  className="w-full accent-accent"
                />
              </Field>
              <Field label="添加弹幕">
                <div className="flex gap-2">
                  <input
                    value={danmakuUrl}
                    onChange={(e) => setDanmakuUrl(e.target.value)}
                    placeholder="斗鱼/虎牙/B站直播间"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    disabled={isAddingDanmaku}
                    onClick={() =>
                      void onAddDanmaku(danmakuUrl).then(() =>
                        setDanmakuUrl("")
                      )
                    }
                    className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {isAddingDanmaku ? "连接中..." : "添加"}
                  </button>
                </div>
              </Field>
              <div className="space-y-2">
                {danmakuList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                  >
                    <span className="truncate text-xs">{item.url}</span>
                    <RowButton
                      label="断开"
                      onClick={() => onRemoveDanmaku(item.id)}
                      danger
                    >
                      <Trash size={16} />
                    </RowButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "help" && (
            <div className="space-y-3 text-sm text-muted">
              <p>视频默认静音播放，请手动打开声音。</p>
              <p>
                自由布局模式下，拖动视频顶部栏移动位置，拖动角落调整大小。
              </p>
              <p>每个视频卡片都有刷新按钮，可重新获取直播流。</p>
              <p>iPhone 仅支持 HLS 流；虎牙在 iOS 上可能无法播放。</p>
              <p>分享链接会保存当前视频列表、弹幕和布局配置。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

function RadioGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            "rounded-lg border px-3 py-1.5 text-xs transition-colors",
            value === opt.value
              ? "border-accent bg-accent/20 text-foreground"
              : "border-border text-muted hover:border-accent/50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function RowButton({
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
      onClick={onClick}
      className={clsx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
        danger
          ? "text-red-300 hover:bg-red-500/20"
          : "text-muted hover:bg-white/10 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
