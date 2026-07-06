"use client";

import { useEffect, useState } from "react";
import {
  ArrowsClockwise,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeSlash,
  Plus,
  SlidersHorizontal,
  Trash,
  X,
} from "@phosphor-icons/react";
import clsx from "clsx";
import type {
  DanmakuDisplayMode,
  GridLayoutState,
  IDanmaku,
  IQnType,
  IStreamType,
  IVideo,
  IVideoOrder,
  LayoutMode,
} from "@/types";
import { GridSettingsSection } from "@/features/grid-layout/GridSettingsSection";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  focus?: SettingsFocus;
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
  onRefreshVideo: (id: string, options?: { force?: boolean }) => void;
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
  gridLayout?: GridLayoutState;
  onGridChange?: (grid: GridLayoutState) => void;
}

type Tab = "video" | "danmaku" | "help";
export type SettingsSubTab = "add" | "settings";
export type SettingsFocus = {
  tab?: Tab;
  subTab?: SettingsSubTab;
};

const QN_OPTIONS: IQnType[] = ["原画", "蓝光", "超清", "高清", "流畅"];

export function SettingsPanel({
  open,
  onClose,
  focus,
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
  gridLayout,
  onGridChange,
}: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>("video");
  const [videoSubTab, setVideoSubTab] = useState<SettingsSubTab>("add");
  const [danmakuSubTab, setDanmakuSubTab] = useState<SettingsSubTab>("add");
  const [videoUrl, setVideoUrl] = useState("");
  const [danmakuUrl, setDanmakuUrl] = useState("");

  useEffect(() => {
    if (!open || !focus) return;
    if (focus.tab) setTab(focus.tab);
    if (focus.subTab) {
      if (!focus.tab || focus.tab === "video") setVideoSubTab(focus.subTab);
      if (!focus.tab || focus.tab === "danmaku") setDanmakuSubTab(focus.subTab);
    }
  }, [open, focus]);

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
              <SubTabBar
                value={videoSubTab}
                onChange={setVideoSubTab}
                addCount={videoOrderList.length}
              />

              {videoSubTab === "settings" ? (
                <div className="space-y-4">
                  <Field label="布局模式">
                    <RadioGroup
                      value={layoutMode}
                      options={[
                        { value: "overlap", label: "重叠模式" },
                        { value: "equal", label: "均分模式" },
                        { value: "free", label: "自由布局" },
                        { value: "grid", label: "网格模式" },
                      ]}
                      onChange={(v) => onLayoutModeChange(v as LayoutMode)}
                    />
                  </Field>

                  {layoutMode === "equal" ? (
                    <Field label="均分列数" hint="每行视频数量">
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={lineCount}
                        onChange={(e) =>
                          onLineCountChange(Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </Field>
                  ) : null}

                  {layoutMode === "grid" && gridLayout && onGridChange ? (
                    <GridSettingsSection
                      grid={gridLayout}
                      onGridChange={onGridChange}
                      embedded
                    />
                  ) : null}

                  <Field label={`流类型（当前: ${streamType.toUpperCase()}）`}>
                    <p className="text-xs text-muted">
                      iOS / macOS 自动使用 HLS，其他平台默认 FLV
                    </p>
                  </Field>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="默认画质" hint="新添加视频时使用的画质">
                    <RadioGroup
                      value={qnName}
                      options={QN_OPTIONS.map((q) => ({
                        value: q,
                        label: q,
                      }))}
                      onChange={(v) => onQnNameChange(v as IQnType)}
                    />
                  </Field>

                  <Field label="添加直播间">
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
                          void onAddVideo(videoUrl, qnName).then(() =>
                            setVideoUrl("")
                          )
                        }
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        <Plus size={16} weight="bold" />
                        {isAddingVideo ? "添加中..." : "添加"}
                      </button>
                    </div>
                  </Field>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted">
                      已添加 {videoOrderList.length} 个
                    </p>
                    {videoOrderList.length === 0 ? (
                      <EmptyListHint text="暂无视频，在上方输入直播间地址添加" />
                    ) : (
                      videoOrderList.map((item, index) => {
                        const video = videos.find((v) => v.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface-elevated/50 p-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs">{item.url}</p>
                              <p className="text-[10px] text-muted">
                                {item.qnName}
                              </p>
                            </div>
                            <RowButton
                              label="刷新"
                              onClick={() =>
                                onRefreshVideo(item.id, { force: true })
                              }
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
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "danmaku" && (
            <div className="space-y-4">
              <SubTabBar
                value={danmakuSubTab}
                onChange={setDanmakuSubTab}
                addCount={danmakuList.length}
              />

              {danmakuSubTab === "settings" ? (
                <div className="space-y-4">
                  <Field
                    label="显示模式"
                    hint="独立模式按房间号将弹幕飘在对应直播画面内；找不到对应画面时飘在最外层"
                  >
                    <RadioGroup
                      value={danmakuDisplayMode}
                      options={[
                        { value: "independent", label: "独立" },
                        { value: "merged", label: "重合" },
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
                  <Field
                    label={`弹幕密度 ${danmakuDensity}`}
                    hint="同轨道最小间距，越大越稀疏；过载时会自动丢弃旧弹幕"
                  >
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
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="添加弹幕源">
                    <div className="flex gap-2">
                      <input
                        value={danmakuUrl}
                        onChange={(e) => setDanmakuUrl(e.target.value)}
                        placeholder="斗鱼/虎牙/B站直播间"
                        className="min-w-0 flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-accent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && danmakuUrl.trim()) {
                            void onAddDanmaku(danmakuUrl).then(() =>
                              setDanmakuUrl("")
                            );
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={isAddingDanmaku}
                        onClick={() =>
                          void onAddDanmaku(danmakuUrl).then(() =>
                            setDanmakuUrl("")
                          )
                        }
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        <Plus size={16} weight="bold" />
                        {isAddingDanmaku ? "连接中..." : "添加"}
                      </button>
                    </div>
                  </Field>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted">
                      已连接 {danmakuList.length} 个
                    </p>
                    {danmakuList.length === 0 ? (
                      <EmptyListHint text="暂无弹幕连接，在上方输入直播间地址添加" />
                    ) : (
                      danmakuList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-elevated/50 px-3 py-2"
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
                      ))
                    )}
                  </div>
                </div>
              )}
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
              <p>
                网格模式下，在设置中调整行列布局；点击格子选中后，使用底部操作栏选择合并方向；拖动视频格子可交换位置。画面点击不会暂停直播。
              </p>
              <p>分享链接会保存当前视频列表、弹幕和布局配置。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubTabBar({
  value,
  onChange,
  addCount,
}: {
  value: SettingsSubTab;
  onChange: (v: SettingsSubTab) => void;
  addCount: number;
}) {
  return (
    <div
      role="tablist"
      aria-label="设置分类"
      className="grid grid-cols-2 gap-0.5 rounded-lg border border-border/60 bg-surface-elevated/50 p-0.5"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "add"}
        onClick={() => onChange("add")}
        className={clsx(
          "flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
          value === "add"
            ? "bg-accent/20 font-medium text-foreground"
            : "text-muted hover:text-foreground"
        )}
      >
        <Plus size={14} aria-hidden />
        添加
        {addCount > 0 ? (
          <span className="rounded-full bg-accent/30 px-1 py-px text-[9px] tabular-nums leading-none">
            {addCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "settings"}
        onClick={() => onChange("settings")}
        className={clsx(
          "flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
          value === "settings"
            ? "bg-accent/20 font-medium text-foreground"
            : "text-muted hover:text-foreground"
        )}
      >
        <SlidersHorizontal size={14} aria-hidden />
        设置
      </button>
    </div>
  );
}

function EmptyListHint({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-surface-elevated/30 px-4 py-8 text-center">
      <p className="text-xs text-muted">{text}</p>
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
