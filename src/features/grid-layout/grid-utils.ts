import type { GridLayoutState, GridSlot } from "@/types";

const GAP_PERCENT = 0.4;

export function createInitialGrid(rows: number, cols: number): GridLayoutState {
  const slots: GridSlot[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      slots.push({
        id: `cell-${row}-${col}`,
        row,
        col,
        rowSpan: 1,
        colSpan: 1,
        videoId: null,
      });
    }
  }
  return { rows, cols, slots, gap: GAP_PERCENT };
}

export function slotRect(
  slot: GridSlot,
  rows: number,
  cols: number,
  gap: number = GAP_PERCENT
): { x: number; y: number; w: number; h: number } {
  const totalGapX = gap * (cols - 1);
  const totalGapY = gap * (rows - 1);
  const cellW = (100 - totalGapX) / cols;
  const cellH = (100 - totalGapY) / rows;

  const x = slot.col * (cellW + gap);
  const y = slot.row * (cellH + gap);
  const w = slot.colSpan * cellW + (slot.colSpan - 1) * gap;
  const h = slot.rowSpan * cellH + (slot.rowSpan - 1) * gap;

  return { x, y, w, h };
}

interface Bounds {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

function getBounds(slot: GridSlot): Bounds {
  return {
    r0: slot.row,
    c0: slot.col,
    r1: slot.row + slot.rowSpan,
    c1: slot.col + slot.colSpan,
  };
}

function unionBounds(a: GridSlot, b: GridSlot): Bounds {
  const ba = getBounds(a);
  const bb = getBounds(b);
  return {
    r0: Math.min(ba.r0, bb.r0),
    c0: Math.min(ba.c0, bb.c0),
    r1: Math.max(ba.r1, bb.r1),
    c1: Math.max(ba.c1, bb.c1),
  };
}

function rectsOverlap(a: Bounds, b: Bounds): boolean {
  return a.r0 < b.r1 && a.r1 > b.r0 && a.c0 < b.c1 && a.c1 > b.c0;
}

export function canMergeSlots(
  slots: GridSlot[],
  idA: string,
  idB: string
): boolean {
  const a = slots.find((s) => s.id === idA);
  const b = slots.find((s) => s.id === idB);
  if (!a || !b || a.id === b.id) return false;

  const ua = unionBounds(a, b);
  const areaA = a.rowSpan * a.colSpan;
  const areaB = b.rowSpan * b.colSpan;
  const areaU = (ua.r1 - ua.r0) * (ua.c1 - ua.c0);
  if (areaU !== areaA + areaB) return false;

  for (const s of slots) {
    if (s.id === a.id || s.id === b.id) continue;
    if (rectsOverlap(ua, getBounds(s))) return false;
  }
  return true;
}

export function mergeSlots(
  state: GridLayoutState,
  idA: string,
  idB: string
): GridLayoutState {
  if (!canMergeSlots(state.slots, idA, idB)) return state;

  const a = state.slots.find((s) => s.id === idA)!;
  const b = state.slots.find((s) => s.id === idB)!;
  const ua = unionBounds(a, b);

  const videos = [a.videoId, b.videoId].filter(Boolean) as string[];
  const merged: GridSlot = {
    id: a.id,
    row: ua.r0,
    col: ua.c0,
    rowSpan: ua.r1 - ua.r0,
    colSpan: ua.c1 - ua.c0,
    videoId: videos[0] ?? null,
  };

  let slots = state.slots.filter((s) => s.id !== a.id && s.id !== idB);
  slots.push(merged);

  if (videos.length > 1) {
    slots = placeVideoInFirstEmpty(slots, videos[1]);
  }

  return { ...state, slots };
}

export function splitSlot(
  state: GridLayoutState,
  slotId: string
): GridLayoutState {
  const slot = state.slots.find((s) => s.id === slotId);
  if (!slot || (slot.rowSpan === 1 && slot.colSpan === 1)) return state;

  const newSlots: GridSlot[] = [];
  let videoPlaced = false;

  for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
    for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
      newSlots.push({
        id: `cell-${r}-${c}-${Date.now()}`,
        row: r,
        col: c,
        rowSpan: 1,
        colSpan: 1,
        videoId: !videoPlaced && slot.videoId ? slot.videoId : null,
      });
      if (slot.videoId) videoPlaced = true;
    }
  }

  return {
    ...state,
    slots: state.slots.filter((s) => s.id !== slotId).concat(newSlots),
  };
}

export function swapSlotVideos(
  state: GridLayoutState,
  fromId: string,
  toId: string
): GridLayoutState {
  const from = state.slots.find((s) => s.id === fromId);
  const to = state.slots.find((s) => s.id === toId);
  if (!from || !to || fromId === toId) return state;

  return {
    ...state,
    slots: state.slots.map((s) => {
      if (s.id === fromId) return { ...s, videoId: to.videoId };
      if (s.id === toId) return { ...s, videoId: from.videoId };
      return s;
    }),
  };
}

export function moveVideoToSlot(
  state: GridLayoutState,
  fromId: string,
  toId: string
): GridLayoutState {
  const from = state.slots.find((s) => s.id === fromId);
  const to = state.slots.find((s) => s.id === toId);
  if (!from?.videoId || !to || fromId === toId) return state;

  if (to.videoId) {
    return swapSlotVideos(state, fromId, toId);
  }

  const videoId = from.videoId;
  return {
    ...state,
    slots: state.slots.map((s) => {
      if (s.id === fromId) return { ...s, videoId: null };
      if (s.id === toId) return { ...s, videoId };
      return s;
    }),
  };
}

function placeVideoInFirstEmpty(
  slots: GridSlot[],
  videoId: string
): GridSlot[] {
  let placed = false;
  return slots.map((s) => {
    if (!placed && !s.videoId) {
      placed = true;
      return { ...s, videoId };
    }
    return s;
  });
}

export function reconcileGridWithVideos(
  state: GridLayoutState,
  videoIds: string[]
): GridLayoutState {
  const valid = new Set(videoIds);
  const slots = state.slots.map((s) => ({
    ...s,
    videoId: s.videoId && valid.has(s.videoId) ? s.videoId : null,
  }));

  const assigned = new Set(
    slots.map((s) => s.videoId).filter((id): id is string => Boolean(id))
  );

  let next: GridLayoutState = { ...state, slots };
  for (const id of videoIds) {
    if (!assigned.has(id)) {
      next = assignVideoToFirstEmpty(next, id);
      assigned.add(id);
    }
  }
  return next;
}

export function isSameGridState(
  a: GridLayoutState,
  b: GridLayoutState
): boolean {
  if (a.rows !== b.rows || a.cols !== b.cols || a.gap !== b.gap) return false;
  if (a.slots.length !== b.slots.length) return false;
  const byId = new Map(b.slots.map((s) => [s.id, s]));
  return a.slots.every((s) => {
    const t = byId.get(s.id);
    if (!t) return false;
    return (
      s.row === t.row &&
      s.col === t.col &&
      s.rowSpan === t.rowSpan &&
      s.colSpan === t.colSpan &&
      s.videoId === t.videoId
    );
  });
}

export function removeVideoFromGrid(
  state: GridLayoutState,
  videoId: string
): GridLayoutState {
  return {
    ...state,
    slots: state.slots.map((s) =>
      s.videoId === videoId ? { ...s, videoId: null } : s
    ),
  };
}

export function resizeGrid(
  state: GridLayoutState,
  rows: number,
  cols: number
): GridLayoutState {
  const clampedRows = Math.max(1, Math.min(6, rows));
  const clampedCols = Math.max(1, Math.min(6, cols));
  const videoIds = state.slots
    .map((s) => s.videoId)
    .filter(Boolean) as string[];

  let next = createInitialGrid(clampedRows, clampedCols);
  for (const vid of videoIds) {
    next = assignVideoToFirstEmpty(next, vid);
  }
  return next;
}

export function findSlotByVideoId(
  state: GridLayoutState,
  videoId: string
): GridSlot | undefined {
  return state.slots.find((s) => s.videoId === videoId);
}

export function isMergedSlot(slot: GridSlot): boolean {
  return slot.rowSpan > 1 || slot.colSpan > 1;
}

export function assignVideoToFirstEmpty(
  state: GridLayoutState,
  videoId: string
): GridLayoutState {
  return {
    ...state,
    slots: placeVideoInFirstEmpty(state.slots, videoId),
  };
}

function rowsShareSpan(a: Bounds, b: Bounds): boolean {
  return a.r0 < b.r1 && a.r1 > b.r0;
}

function colsShareSpan(a: Bounds, b: Bounds): boolean {
  return a.c0 < b.c1 && a.c1 > b.c0;
}

/** 与指定格子可合并的相邻格子 */
export function getMergeableNeighbors(
  slots: GridSlot[],
  slotId: string
): GridSlot[] {
  return slots.filter(
    (s) => s.id !== slotId && canMergeSlots(slots, slotId, s.id)
  );
}

export type MergeDirection = "top" | "right" | "bottom" | "left";

/** 选中格子可合并的方向 */
export function getMergeHandlesForSlot(
  slot: GridSlot,
  neighbors: GridSlot[]
): { neighborId: string; direction: MergeDirection }[] {
  const ba = getBounds(slot);
  const handles: { neighborId: string; direction: MergeDirection }[] = [];

  for (const neighbor of neighbors) {
    const bb = getBounds(neighbor);

    if (bb.c0 === ba.c1 && rowsShareSpan(ba, bb)) {
      handles.push({ neighborId: neighbor.id, direction: "right" });
      continue;
    }
    if (ba.c0 === bb.c1 && rowsShareSpan(ba, bb)) {
      handles.push({ neighborId: neighbor.id, direction: "left" });
      continue;
    }
    if (bb.r0 === ba.r1 && colsShareSpan(ba, bb)) {
      handles.push({ neighborId: neighbor.id, direction: "bottom" });
      continue;
    }
    if (ba.r0 === bb.r1 && colsShareSpan(ba, bb)) {
      handles.push({ neighborId: neighbor.id, direction: "top" });
    }
  }

  return handles;
}

/** @deprecated 使用 getMergeHandlesForSlot */
export function getMergeHandlePosition(
  a: GridSlot,
  b: GridSlot,
  rows: number,
  cols: number,
  gap: number = GAP_PERCENT
): { x: number; y: number } | null {
  const ra = slotRect(a, rows, cols, gap);
  const rb = slotRect(b, rows, cols, gap);
  const ba = getBounds(a);
  const bb = getBounds(b);

  const overlapY = Math.max(ba.r0, bb.r0) < Math.min(ba.r1, bb.r1);
  const overlapX = Math.max(ba.c0, bb.c0) < Math.min(ba.c1, bb.c1);

  if (ba.c1 === bb.c0 && overlapY) {
    return {
      x: (ra.x + ra.w + rb.x) / 2,
      y: Math.max(ra.y, rb.y) + Math.min(ra.h, rb.h) / 2,
    };
  }
  if (bb.c1 === ba.c0 && overlapY) {
    return {
      x: (rb.x + rb.w + ra.x) / 2,
      y: Math.max(ra.y, rb.y) + Math.min(ra.h, rb.h) / 2,
    };
  }
  if (ba.r1 === bb.r0 && overlapX) {
    return {
      x: Math.max(ra.x, rb.x) + Math.min(ra.w, rb.w) / 2,
      y: (ra.y + ra.h + rb.y) / 2,
    };
  }
  if (bb.r1 === ba.r0 && overlapX) {
    return {
      x: Math.max(ra.x, rb.x) + Math.min(ra.w, rb.w) / 2,
      y: (rb.y + rb.h + ra.y) / 2,
    };
  }
  return null;
}

export const GRID_PRESETS: { label: string; rows: number; cols: number }[] = [
  { label: "1×1", rows: 1, cols: 1 },
  { label: "1×2", rows: 1, cols: 2 },
  { label: "2×2", rows: 2, cols: 2 },
  { label: "2×3", rows: 2, cols: 3 },
  { label: "3×3", rows: 3, cols: 3 },
  { label: "4×4", rows: 4, cols: 4 },
];
