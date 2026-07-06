"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deserialize, DouyuDanmu } from "douyu-danmu-ws";
import { LiveWS } from "bilibili-live-ws/browser";
import { Plus } from "@phosphor-icons/react";
import type {
  DanmakuDisplayMode,
  GridLayoutState,
  IDanmaku,
  IQnType,
  IStreamType,
  IVideo,
  IVideoOrder,
  LayoutMode,
  VideoLayout,
} from "@/types";
import {
  apiGetBilibiliRealRid,
  apiGetDouyuRealRid,
  apiGetHuyaChannelInfo,
} from "@/apis";
import { FreeLayoutCanvas } from "@/features/free-layout/FreeLayoutCanvas";
import {
  buildShareUrl,
  createDefaultLayout,
  migrateShowType,
  parseShareDanmakuList,
  parseShareGridLayout,
  parseShareVideoList,
} from "@/features/free-layout/layout-utils";
import { GridLayoutCanvas } from "@/features/grid-layout/GridLayoutCanvas";
import {
  assignVideoToFirstEmpty,
  createInitialGrid,
  isSameGridState,
  reconcileGridWithVideos,
  removeVideoFromGrid,
} from "@/features/grid-layout/grid-utils";
import {
  DanmakuLayer,
  getDouyuDanmakuColor,
  type DanmakuLayerHandle,
} from "@/features/danmaku/DanmakuLayer";
import {
  getStreamErrorMessage,
  resolveStreamUrl,
} from "@/features/video/stream-service";
import {
  arrayMoveDown,
  arrayMoveUp,
  copyText,
  detectStreamType,
  getLastField,
  getStrMiddle,
  isRid,
  parseUrlParams,
  sleep,
} from "@/lib/utils";
import useLatest from "@/hooks/useLatest";
import { initHuyaDanmaku } from "@/lib/danmaku/huya";
import { resolveRoomKey } from "@/lib/room-key";
import { ControlDock, type DockDisplayState } from "@/components/live/ControlDock";
import { SettingsPanel, type SettingsFocus } from "@/components/live/SettingsPanel";

interface LiveRoomClientProps {
  shareVideo?: string | null;
  shareDanmaku?: string | null;
  shareLayoutMode?: string | null;
  shareLineCount?: string | null;
  shareGrid?: string | null;
  legacyShowType?: string | null;
}

export function LiveRoomClient({
  shareVideo,
  shareDanmaku,
  shareLayoutMode,
  shareLineCount,
  shareGrid,
  legacyShowType,
}: LiveRoomClientProps) {
  const [streamType] = useState<IStreamType>(() => detectStreamType());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("free");
  const [lineCount, setLineCount] = useState(2);
  const [qnName, setQnName] = useState<IQnType>("原画");
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [videoOrderList, setVideoOrderList] = useState<IVideoOrder[]>([]);
  const [danmakuList, setDanmakuList] = useState<IDanmaku[]>([]);
  const [danmakuOpacity, setDanmakuOpacity] = useState(90);
  const [danmakuDensity, setDanmakuDensity] = useState(20);
  const [danmakuSpeed, setDanmakuSpeed] = useState(120);
  const [danmakuDisplayMode, setDanmakuDisplayMode] =
    useState<DanmakuDisplayMode>("independent");
  const [gridLayout, setGridLayout] = useState<GridLayoutState>(() =>
    createInitialGrid(2, 2)
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsFocus, setSettingsFocus] = useState<SettingsFocus | undefined>();
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isAddingDanmaku, setIsAddingDanmaku] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dockDisplayState, setDockDisplayState] =
    useState<DockDisplayState>("collapsed");
  const [isDockClosed, setIsDockClosed] = useState(false);

  const danmakuRef = useRef<DanmakuLayerHandle>(null);
  const fallbackDanmakuRef = useRef<DanmakuLayerHandle>(null);
  const videoDanmakuRefs = useRef<Map<string, DanmakuLayerHandle>>(new Map());
  const videoOrderListRef = useLatest(videoOrderList);
  const danmakuListRef = useLatest(danmakuList);
  const videosRef = useLatest(videos);
  const danmakuDisplayModeRef = useLatest(danmakuDisplayMode);
  const layoutModeRef = useLatest(layoutMode);
  const refreshLocks = useRef<Set<string>>(new Set());
  const isAppReadyRef = useRef(false);

  const openSettings = useCallback((focus?: SettingsFocus) => {
    setSettingsFocus(focus);
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
    setSettingsFocus(undefined);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("dockVisible");
    if (saved !== null) {
      setDockDisplayState(saved === "true" ? "expanded" : "collapsed");
    }
    const savedSpeed = localStorage.getItem("danmakuSpeed");
    if (savedSpeed) setDanmakuSpeed(Number(savedSpeed));
    const savedOpacity = localStorage.getItem("danmakuOpacity");
    if (savedOpacity) setDanmakuOpacity(Number(savedOpacity));
    const savedDensity = localStorage.getItem("danmakuDensity");
    if (savedDensity) setDanmakuDensity(Number(savedDensity));
    const savedDisplayMode = localStorage.getItem("danmakuDisplayMode");
    if (savedDisplayMode === "merged" || savedDisplayMode === "independent") {
      setDanmakuDisplayMode(savedDisplayMode);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDockClosed) {
      localStorage.setItem(
        "dockVisible",
        String(dockDisplayState === "expanded")
      );
    }
  }, [dockDisplayState, isDockClosed]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    initHuyaDanmaku();
  }, []);

  const registerVideoDanmaku = useCallback(
    (videoId: string, handle: DanmakuLayerHandle | null) => {
      if (handle) {
        videoDanmakuRefs.current.set(videoId, handle);
      } else {
        videoDanmakuRefs.current.delete(videoId);
      }
    },
    []
  );

  const pushDanmaku = useCallback(
    (roomKey: string, text: string, opts?: { color?: string }) => {
      if (danmakuDisplayModeRef.current === "merged") {
        danmakuRef.current?.push(text, opts);
        return;
      }

      const candidates = videosRef.current.filter(
        (v) =>
          v.rid &&
          roomKey &&
          String(v.rid) === String(roomKey) &&
          v.layout.visible
      );

      let target = candidates[0];
      if (candidates.length > 1 && layoutModeRef.current === "overlap") {
        target = candidates.reduce((best, v) =>
          v.order > best.order ? v : best
        );
      }

      if (target) {
        videoDanmakuRefs.current.get(target.id)?.push(text, opts);
      } else {
        fallbackDanmakuRef.current?.push(text, opts);
      }
    },
    [danmakuDisplayModeRef, layoutModeRef, videosRef]
  );

  const syncVideoOrder = useCallback(() => {
    setVideos((prev) => {
      const orderMap = new Map(
        videoOrderList.map((item, index) => [item.id, index])
      );
      return prev.map((v) => ({
        ...v,
        order: orderMap.get(v.id) ?? v.order,
      }));
    });
  }, [videoOrderList]);

  useEffect(() => {
    syncVideoOrder();
  }, [syncVideoOrder]);

  const addVideo = useCallback(
    async (
      url: string,
      quality: IQnType = qnName,
      savedLayout?: VideoLayout,
      savedId?: string
    ) => {
      if (!url.trim()) return;
      setIsAddingVideo(true);
      const id = savedId ?? String(Date.now() + Math.random());
      const index = videoOrderListRef.current.length;

      try {
        const { stream, rid, platform } = await resolveStreamUrl(
          url,
          quality,
          streamType
        );
        const errorMessage = getStreamErrorMessage(stream, platform);
        const layout =
          savedLayout ?? createDefaultLayout(index, index + 1);

        const video: IVideo = {
          id,
          order: index,
          url,
          rid,
          stream: errorMessage ? "" : stream,
          qnName: quality,
          streamType,
          platform,
          playbackKey: 1,
          layout,
          status: errorMessage ? "error" : "playing",
          errorMessage: errorMessage ?? undefined,
        };

        setVideos((prev) => [...prev, video]);
        setVideoOrderList((prev) => [...prev, { id, url, qnName: quality, layout }]);

        if (layoutModeRef.current === "grid") {
          setGridLayout((g) => assignVideoToFirstEmpty(g, id));
        }

        if (errorMessage) showToast(errorMessage);
      } catch {
        showToast("网络错误，获取直播流失败");
      } finally {
        setIsAddingVideo(false);
      }
    },
    [qnName, showToast, streamType, videoOrderListRef]
  );

  const refreshVideo = useCallback(
    async (id: string, options?: { force?: boolean }) => {
      if (refreshLocks.current.has(id)) return;
      refreshLocks.current.add(id);

      const target = videos.find((v) => v.id === id);
      if (!target) {
        refreshLocks.current.delete(id);
        return;
      }

      setVideos((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, isRefreshing: true, status: "loading" } : v
        )
      );

      try {
        const { stream, platform } = await resolveStreamUrl(
          target.url,
          target.qnName,
          target.streamType
        );
        const errorMessage = getStreamErrorMessage(stream, platform);

        setVideos((prev) =>
          prev.map((v) => {
            if (v.id !== id) return v;
            if (errorMessage) {
              return {
                ...v,
                isRefreshing: false,
                status: "error",
                errorMessage,
              };
            }
            const streamUnchanged = v.stream === stream;
            return {
              ...v,
              stream,
              playbackKey: streamUnchanged ? v.playbackKey : v.playbackKey + 1,
              isRefreshing: false,
              status: "playing",
              errorMessage: undefined,
            };
          })
        );

        if (errorMessage) showToast(errorMessage);
        else if (options?.force) showToast("直播流已刷新");
      } catch {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === id
              ? {
                  ...v,
                  isRefreshing: false,
                  status: "error",
                  errorMessage: "刷新失败，请稍后重试",
                }
              : v
          )
        );
        showToast("刷新失败，请稍后重试");
      } finally {
        refreshLocks.current.delete(id);
      }
    },
    [showToast, videos]
  );

  const loadVideoList = useCallback(
    async (list: IVideoOrder[]) => {
      for (const item of list) {
        await addVideo(item.url, item.qnName, item.layout, item.id);
      }
    },
    [addVideo]
  );

  const addDanmaku = useCallback(
    async (url: string) => {
      if (!url.trim()) return;
      setIsAddingDanmaku(true);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      let ws: IDanmaku["ws"] = null;
      let roomKey = "";

      try {
        roomKey = await resolveRoomKey(url);
        let rid = getLastField(url);
        if (!isRid(rid)) {
          const queryObj = parseUrlParams(url);
          if (queryObj.rid) rid = queryObj.rid;
        }

        if (url.includes("douyu.com")) {
          const realRid = roomKey || String(await apiGetDouyuRealRid(rid));
          ws = new DouyuDanmu(
            realRid,
            (msg: string) => {
              const msgType = getStrMiddle(msg, "type@=", "/");
              if (msgType === "chatmsg") {
                const data = deserialize(msg) as {
                  txt?: string;
                  col?: string | number;
                };
                if (data.txt) {
                  pushDanmaku(realRid, data.txt, {
                    color: getDouyuDanmakuColor(data.col),
                  });
                }
              }
            },
            () => ws?.close?.()
          );
        } else if (url.includes("bilibili.com")) {
          const realRid = roomKey || String(await apiGetBilibiliRealRid(rid));
          ws = new LiveWS(Number(realRid));
          (ws as LiveWS).on("DANMU_MSG", (data: { info: [unknown[], string, unknown[]] }) => {
            const info = data.info;
            const colorNum = Number((info[0] as number[])[3]);
            pushDanmaku(realRid, String(info[1]), {
              color: `#${colorNum.toString(16)}`,
            });
          });
        } else if (url.includes("huya.com")) {
          const { channelId, subChannelId } = await apiGetHuyaChannelInfo(rid);
          ws = window.HuYaListener(channelId, subChannelId, (msg) => {
            pushDanmaku(roomKey, msg.sContent, {
              color:
                msg.tBulletFormat.iFontColor > 0
                  ? `#${msg.tBulletFormat.iFontColor.toString(16)}`
                  : "#ffffff",
            });
          });
        }
        setDanmakuList((prev) => [
          ...prev,
          { id, url, rid: String(roomKey), ws },
        ]);
      } catch {
        showToast("弹幕连接失败");
      } finally {
        setIsAddingDanmaku(false);
      }
    },
    [pushDanmaku, showToast]
  );

  const loadDanmakuList = useCallback(
    async (list: { url: string }[]) => {
      for (let i = 0; i < list.length; i++) {
        await addDanmaku(list[i].url);
        while (danmakuListRef.current.length <= i) {
          await sleep(300);
        }
      }
    },
    [addDanmaku, danmakuListRef]
  );

  useEffect(() => {
    const init = async () => {
      const mode =
        shareLayoutMode ??
        legacyShowType ??
        localStorage.getItem("layoutMode") ??
        localStorage.getItem("showType");
      setLayoutMode(migrateShowType(mode));

      const savedLineCount =
        shareLineCount ?? localStorage.getItem("lineCount") ?? "2";
      setLineCount(Number(savedLineCount));

      const sharedGrid = parseShareGridLayout(shareGrid ?? null);
      if (sharedGrid) {
        setGridLayout(sharedGrid);
      } else {
        const localGrid = localStorage.getItem("gridLayout");
        if (localGrid) {
          try {
            setGridLayout(JSON.parse(localGrid) as GridLayoutState);
          } catch {
            // ignore
          }
        }
      }

      if (shareVideo) {
        await loadVideoList(parseShareVideoList(shareVideo));
      } else {
        const local = localStorage.getItem("videoOrderList");
        if (local) await loadVideoList(JSON.parse(local) as IVideoOrder[]);
      }

      if (shareDanmaku) {
        await loadDanmakuList(parseShareDanmakuList(shareDanmaku));
      } else {
        const local = localStorage.getItem("danmakuList");
        if (local) {
          try {
            const parsed = JSON.parse(local) as { url: string }[];
            if (parsed.length > 0) {
              await loadDanmakuList(parsed);
            }
          } catch {
            // ignore invalid localStorage
          }
        }
      }

      isAppReadyRef.current = true;

      localStorage.setItem(
        "danmakuList",
        JSON.stringify(danmakuListRef.current.map(({ url }) => ({ url })))
      );
      localStorage.setItem(
        "videoOrderList",
        JSON.stringify(
          videoOrderListRef.current.map(({ id, url, qnName, layout }) => ({
            id,
            url,
            qnName,
            layout,
          }))
        )
      );
    };
    void init();
  }, [
    legacyShowType,
    loadDanmakuList,
    loadVideoList,
    shareDanmaku,
    shareGrid,
    shareLayoutMode,
    shareLineCount,
    shareVideo,
  ]);

  useEffect(() => {
    if (!isAppReadyRef.current) return;
    localStorage.setItem(
      "videoOrderList",
      JSON.stringify(
        videoOrderList.map(({ id, url, qnName: q, layout }) => ({
          id,
          url,
          qnName: q,
          layout,
        }))
      )
    );
  }, [videoOrderList]);

  useEffect(() => {
    if (!isAppReadyRef.current) return;
    localStorage.setItem(
      "danmakuList",
      JSON.stringify(danmakuList.map(({ url }) => ({ url })))
    );
  }, [danmakuList]);

  useEffect(() => {
    if (!isAppReadyRef.current) return;
    localStorage.setItem("layoutMode", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    if (!isAppReadyRef.current) return;
    localStorage.setItem("lineCount", String(lineCount));
  }, [lineCount]);

  useEffect(() => {
    if (!isAppReadyRef.current) return;
    localStorage.setItem("gridLayout", JSON.stringify(gridLayout));
  }, [gridLayout]);

  useEffect(() => {
    localStorage.setItem("danmakuSpeed", String(danmakuSpeed));
  }, [danmakuSpeed]);

  useEffect(() => {
    localStorage.setItem("danmakuOpacity", String(danmakuOpacity));
  }, [danmakuOpacity]);

  useEffect(() => {
    localStorage.setItem("danmakuDensity", String(danmakuDensity));
  }, [danmakuDensity]);

  useEffect(() => {
    localStorage.setItem("danmakuDisplayMode", danmakuDisplayMode);
  }, [danmakuDisplayMode]);

  const videoIdsKey = useMemo(
    () => videos.map((v) => v.id).join("|"),
    [videos]
  );

  useEffect(() => {
    if (layoutMode !== "grid") return;
    const videoIds = videoIdsKey ? videoIdsKey.split("|") : [];
    setGridLayout((g) => {
      const next = reconcileGridWithVideos(g, videoIds);
      return isSameGridState(g, next) ? g : next;
    });
  }, [layoutMode, videoIdsKey]);

  const handleLayoutChange = useCallback((id: string, layout: IVideo["layout"]) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, layout } : v))
    );
    setVideoOrderList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, layout } : v))
    );
  }, []);

  const handleToggleVisible = useCallback((id: string) => {
    const toggle = (layout: IVideo["layout"]) => ({
      ...layout,
      visible: !layout.visible,
    });
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, layout: toggle(v.layout) } : v))
    );
    setVideoOrderList((prev) =>
      prev.map((v) =>
        v.id === id && v.layout ? { ...v, layout: toggle(v.layout) } : v
      )
    );
  }, []);

  const handleBringToFront = useCallback((id: string) => {
    setVideos((prev) => {
      const maxZ = Math.max(...prev.map((v) => v.layout.zIndex), 0);
      return prev.map((v) =>
        v.id === id ? { ...v, layout: { ...v.layout, zIndex: maxZ + 1 } } : v
      );
    });
  }, []);

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setVideoOrderList((prev) => prev.filter((v) => v.id !== id));
    setGridLayout((g) => removeVideoFromGrid(g, id));
  }, []);

  const handleCopyStream = useCallback(
    async (id: string) => {
      const video = videos.find((v) => v.id === id);
      if (!video?.stream) return;
      const ok = await copyText(video.stream);
      showToast(ok ? "已复制直播流地址" : "复制失败");
    },
    [showToast, videos]
  );

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(
      location.origin,
      videoOrderList,
      danmakuList.map(({ url }) => ({ url })),
      layoutMode,
      lineCount,
      layoutMode === "grid" ? gridLayout : undefined
    );
    const ok = await copyText(url);
    showToast(ok ? "分享链接已复制" : "复制失败");
  }, [danmakuList, gridLayout, layoutMode, lineCount, showToast, videoOrderList]);

  const effectiveLayoutMode: LayoutMode =
    isMobile && layoutMode === "free" ? "equal" : layoutMode;

  const danmakuLayerProps = {
    opacity: danmakuOpacity,
    density: danmakuDensity,
    speed: danmakuSpeed,
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background text-foreground">
      {danmakuDisplayMode === "merged" ? (
        <DanmakuLayer ref={danmakuRef} {...danmakuLayerProps} />
      ) : (
        <DanmakuLayer
          ref={fallbackDanmakuRef}
          {...danmakuLayerProps}
          className="pointer-events-none absolute inset-0 z-40"
        />
      )}

      <main className="absolute inset-0">
        {videos.length === 0 && layoutMode !== "grid" ? (
          <EmptyState
            onOpenSettings={() =>
              openSettings({ tab: "video", subTab: "add" })
            }
          />
        ) : layoutMode === "grid" ? (
          <GridLayoutCanvas
            videos={videos}
            grid={gridLayout}
            onGridChange={setGridLayout}
            danmakuDisplayMode={danmakuDisplayMode}
            danmakuOpacity={danmakuOpacity}
            danmakuDensity={danmakuDensity}
            danmakuSpeed={danmakuSpeed}
            onVideoDanmakuRef={registerVideoDanmaku}
            onRefresh={refreshVideo}
            onToggleVisible={handleToggleVisible}
            onRemove={handleRemoveVideo}
            onCopyStream={handleCopyStream}
            onOpenSettings={() =>
              openSettings({ tab: "video", subTab: "add" })
            }
          />
        ) : (
          <FreeLayoutCanvas
            videos={videos}
            layoutMode={effectiveLayoutMode}
            lineCount={lineCount}
            danmakuDisplayMode={danmakuDisplayMode}
            danmakuOpacity={danmakuOpacity}
            danmakuDensity={danmakuDensity}
            danmakuSpeed={danmakuSpeed}
            onVideoDanmakuRef={registerVideoDanmaku}
            onLayoutChange={handleLayoutChange}
            onRefresh={refreshVideo}
            onToggleVisible={handleToggleVisible}
            onBringToFront={handleBringToFront}
            onRemove={handleRemoveVideo}
            onCopyStream={handleCopyStream}
          />
        )}
      </main>

      {!isDockClosed ? (
        <ControlDock
          displayState={dockDisplayState}
          onExpand={() => setDockDisplayState("expanded")}
          onCollapse={() => setDockDisplayState("collapsed")}
          onClose={() => setIsDockClosed(true)}
          onOpenSettings={() =>
            openSettings({ tab: "video", subTab: "add" })
          }
          onShare={handleShare}
          layoutMode={layoutMode}
          videoCount={videos.length}
          danmakuCount={danmakuList.length}
        />
      ) : null}

      <SettingsPanel
        open={isSettingsOpen}
        onClose={closeSettings}
        focus={settingsFocus}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        lineCount={lineCount}
        onLineCountChange={setLineCount}
        qnName={qnName}
        onQnNameChange={setQnName}
        onAddVideo={addVideo}
        isAddingVideo={isAddingVideo}
        videos={videos}
        videoOrderList={videoOrderList}
        onMoveVideoUp={(index) =>
          setVideoOrderList((list) => arrayMoveUp(list, index))
        }
        onMoveVideoDown={(index) =>
          setVideoOrderList((list) => arrayMoveDown(list, index))
        }
        onRemoveVideo={handleRemoveVideo}
        onRefreshVideo={refreshVideo}
        onToggleVisible={handleToggleVisible}
        onCopyStream={handleCopyStream}
        danmakuList={danmakuList}
        onAddDanmaku={addDanmaku}
        isAddingDanmaku={isAddingDanmaku}
        onRemoveDanmaku={(id) => {
          const item = danmakuList.find((d) => d.id === id);
          item?.ws?.close?.();
          setDanmakuList((prev) => prev.filter((d) => d.id !== id));
        }}
        danmakuOpacity={danmakuOpacity}
        onDanmakuOpacityChange={setDanmakuOpacity}
        danmakuDensity={danmakuDensity}
        onDanmakuDensityChange={setDanmakuDensity}
        danmakuSpeed={danmakuSpeed}
        onDanmakuSpeedChange={setDanmakuSpeed}
        danmakuDisplayMode={danmakuDisplayMode}
        onDanmakuDisplayModeChange={setDanmakuDisplayMode}
        streamType={streamType}
        gridLayout={gridLayout}
        onGridChange={setGridLayout}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-surface-elevated px-4 py-2 text-sm shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-2xl text-foreground">DouyuEx联播</h1>
      <p className="max-w-md text-sm text-muted">
        添加斗鱼、B站或虎牙直播间，使用自由布局同时观看多个直播。
      </p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Plus size={18} weight="bold" />
        添加第一个直播
      </button>
    </div>
  );
}
