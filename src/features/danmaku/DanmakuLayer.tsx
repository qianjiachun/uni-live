"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  DanmakuEngine,
  type DanmakuEngineOptions,
  type DanmakuPushOptions,
} from "./DanmakuEngine";

export const danmakuColor: Record<string, string> = {
  "1": "rgb(255,0,0)",
  "2": "rgb(30,135,240)",
  "3": "rgb(122,200,75)",
  "4": "rgb(255,127,0)",
  "5": "rgb(155,57,244)",
  "6": "rgb(255,105,180)",
};

const DEFAULT_DANMAKU_COLOR = "#ffffff";

/** 斗鱼弹幕：按 col 等级取色，无匹配则为白色 */
export function getDouyuDanmakuColor(
  col: string | number | undefined | null
): string {
  if (col === undefined || col === null || col === "") {
    return DEFAULT_DANMAKU_COLOR;
  }
  return danmakuColor[String(col)] ?? DEFAULT_DANMAKU_COLOR;
}

export interface DanmakuLayerHandle {
  push: (text: string, opts?: DanmakuPushOptions) => void;
}

interface DanmakuLayerProps {
  opacity: number;
  density: number;
  speed: number;
}

export const DanmakuLayer = forwardRef<DanmakuLayerHandle, DanmakuLayerProps>(
  function DanmakuLayer({ opacity, density, speed }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<DanmakuEngine | null>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const options: DanmakuEngineOptions = {
        opacity: opacity / 100,
        density,
        speed,
      };
      engineRef.current = new DanmakuEngine(container, options);

      return () => {
        engineRef.current?.destroy();
        engineRef.current = null;
      };
      // 引擎只初始化一次，opacity/density 由下方 effect 同步
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      engineRef.current?.setOpacity(opacity / 100);
    }, [opacity]);

    useEffect(() => {
      engineRef.current?.setDensity(density);
    }, [density]);

    useEffect(() => {
      engineRef.current?.setSpeed(speed);
    }, [speed]);

    useImperativeHandle(ref, () => ({
      push(text: string, opts?: DanmakuPushOptions) {
        engineRef.current?.push(text, opts);
      },
    }));

    return (
      <div
        ref={containerRef}
        id="danmaku"
        className="pointer-events-none absolute inset-0 z-40"
        aria-hidden
      />
    );
  }
);
