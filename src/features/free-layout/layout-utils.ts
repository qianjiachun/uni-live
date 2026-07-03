import type { IVideoOrder, LayoutMode, VideoLayout } from "@/types";

const MIN_SIZE = 15;

export function createDefaultLayout(index: number, total: number): VideoLayout {
  const cols = Math.ceil(Math.sqrt(Math.max(total, 1)));
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const w = 100 / cols;
  const h = 100 / rows;

  return {
    x: col * w,
    y: row * h,
    w: Math.max(w - 1, MIN_SIZE),
    h: Math.max(h - 1, MIN_SIZE),
    zIndex: index + 1,
    visible: true,
  };
}

export function clampLayout(layout: VideoLayout): VideoLayout {
  const w = Math.max(MIN_SIZE, Math.min(100, layout.w));
  const h = Math.max(MIN_SIZE, Math.min(100, layout.h));
  const x = Math.max(0, Math.min(100 - w, layout.x));
  const y = Math.max(0, Math.min(100 - h, layout.y));
  return { ...layout, x, y, w, h };
}

export function migrateShowType(showType: string | null): LayoutMode {
  if (showType === "overlap" || showType === "focus") return "overlap";
  if (showType === "line") return "equal";
  if (showType === "grid") return "free";
  if (showType === "equal" || showType === "free") {
    return showType;
  }
  return "free";
}

export function buildShareUrl(
  origin: string,
  videoOrderList: IVideoOrder[],
  danmakuList: { url: string }[],
  layoutMode: LayoutMode,
  lineCount: number
): string {
  const params = new URLSearchParams();
  params.set(
    "video",
    btoa(encodeURIComponent(JSON.stringify(videoOrderList)))
  );
  params.set(
    "danmaku",
    btoa(encodeURIComponent(JSON.stringify(danmakuList)))
  );
  params.set("layoutMode", layoutMode);
  params.set("lineCount", String(lineCount));
  return `${origin}?${params.toString()}`;
}

export function parseShareVideoList(encoded: string | null): IVideoOrder[] {
  if (!encoded) return [];
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as IVideoOrder[];
  } catch {
    return [];
  }
}

export function parseShareDanmakuList(encoded: string | null): { url: string }[] {
  if (!encoded) return [];
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as { url: string }[];
  } catch {
    return [];
  }
}

export type ResizeHandle =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export function applyResize(
  layout: VideoLayout,
  handle: ResizeHandle,
  dx: number,
  dy: number
): VideoLayout {
  let { x, y, w, h } = layout;

  if (handle.includes("e")) w += dx;
  if (handle.includes("w")) {
    w -= dx;
    x += dx;
  }
  if (handle.includes("s")) h += dy;
  if (handle.includes("n")) {
    h -= dy;
    y += dy;
  }

  return clampLayout({ ...layout, x, y, w, h });
}

export function applyDrag(
  layout: VideoLayout,
  dx: number,
  dy: number
): VideoLayout {
  return clampLayout({
    ...layout,
    x: layout.x + dx,
    y: layout.y + dy,
  });
}
