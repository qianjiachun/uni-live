"use client";

import clsx from "clsx";
import { GridFour } from "@phosphor-icons/react";
import {
  GRID_PRESETS,
  resizeGrid,
} from "@/features/grid-layout/grid-utils";
import type { GridLayoutState } from "@/types";

interface GridSettingsSectionProps {
  grid: GridLayoutState;
  onGridChange: (grid: GridLayoutState) => void;
  /** 嵌入设置面板时不重复外框 */
  embedded?: boolean;
}

export function GridSettingsSection({
  grid,
  onGridChange,
  embedded = false,
}: GridSettingsSectionProps) {
  return (
    <section
      className={clsx(
        "space-y-3",
        !embedded &&
          "rounded-xl border border-border/60 bg-surface-elevated/40 p-3"
      )}
    >
      <div className="flex items-center gap-2">
        <GridFour size={18} className="text-accent" aria-hidden />
        <h3 className="text-sm font-medium text-foreground">网格设置</h3>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted">预设布局</p>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {GRID_PRESETS.map((p) => {
            const active = grid.rows === p.rows && grid.cols === p.cols;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onGridChange(resizeGrid(grid, p.rows, p.cols))}
                className={clsx(
                  "rounded-lg border py-2 text-xs transition-colors",
                  active
                    ? "border-accent bg-accent/20 text-foreground"
                    : "border-border/60 text-muted hover:border-accent/40 hover:bg-white/5 hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs text-muted">行数</span>
          <input
            type="number"
            min={1}
            max={6}
            value={grid.rows}
            onChange={(e) =>
              onGridChange(resizeGrid(grid, Number(e.target.value), grid.cols))
            }
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-muted">列数</span>
          <input
            type="number"
            min={1}
            max={6}
            value={grid.cols}
            onChange={(e) =>
              onGridChange(resizeGrid(grid, grid.rows, Number(e.target.value)))
            }
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>

      <p className="text-xs leading-relaxed text-muted">
        点击格子选中后，在底部操作栏选择合并方向；选中已合并格子可拆分。拖动视频格子可交换位置。画面点击不会暂停直播。
      </p>
    </section>
  );
}
