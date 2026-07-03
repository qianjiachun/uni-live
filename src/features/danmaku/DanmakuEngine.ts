export interface DanmakuPushOptions {
  color?: string;
}

export interface DanmakuEngineOptions {
  opacity?: number;
  /** 同轨道最小间距（像素），越大越稀疏 */
  density?: number;
  fontSize?: number;
  /** 横向滚动速度 px/s */
  speed?: number;
  /** 待渲染队列上限，超出丢弃最旧 */
  maxQueueSize?: number;
  /** 队列积压超过此值时，只保留最新一批 */
  queueShedThreshold?: number;
  /** 同时在屏弹幕上限 */
  maxActive?: number;
  /** 在队列中等待超过此毫秒则丢弃 */
  maxWaitMs?: number;
}

interface QueuedItem {
  text: string;
  color: string;
  enqueuedAt: number;
}

interface ActiveItem {
  el: HTMLDivElement;
  lane: number;
  endAt: number;
}

const DEFAULT_COLOR = "#ffffff";

export class DanmakuEngine {
  private container: HTMLElement;
  private options: Required<DanmakuEngineOptions>;
  private queue: QueuedItem[] = [];
  private active: ActiveItem[] = [];
  private laneReleaseAt: number[] = [];
  private laneCount = 0;
  private rafId = 0;
  private destroyed = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, options: DanmakuEngineOptions = {}) {
    this.container = container;
    this.options = {
      opacity: options.opacity ?? 0.9,
      density: options.density ?? 20,
      fontSize: options.fontSize ?? 20,
      speed: options.speed ?? 120,
      maxQueueSize: options.maxQueueSize ?? 80,
      queueShedThreshold: options.queueShedThreshold ?? 40,
      maxActive: options.maxActive ?? 60,
      maxWaitMs: options.maxWaitMs ?? 2500,
    };
    this.applyContainerStyle();
    this.recalcLanes();
    this.resizeObserver = new ResizeObserver(() => this.recalcLanes());
    this.resizeObserver.observe(container);
    this.tick();
  }

  setOpacity(opacity: number) {
    this.options.opacity = opacity;
    this.container.style.opacity = String(opacity);
  }

  setDensity(density: number) {
    this.options.density = density;
  }

  setSpeed(speed: number) {
    this.options.speed = Math.max(40, Math.min(400, speed));
  }

  push(text: string, opts: DanmakuPushOptions = {}) {
    if (this.destroyed || !text.trim()) return;

    const item: QueuedItem = {
      text: text.trim(),
      color: opts.color ?? DEFAULT_COLOR,
      enqueuedAt: performance.now(),
    };

    this.queue.push(item);

    if (this.queue.length > this.options.maxQueueSize) {
      this.queue.splice(0, this.queue.length - this.options.maxQueueSize);
    }

    if (this.queue.length > this.options.queueShedThreshold) {
      this.queue = this.queue.slice(
        -Math.floor(this.options.queueShedThreshold * 0.6)
      );
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.active.forEach(({ el }) => el.remove());
    this.active = [];
    this.queue = [];
  }

  private applyContainerStyle() {
    this.container.style.position = "absolute";
    this.container.style.inset = "0";
    this.container.style.overflow = "hidden";
    this.container.style.pointerEvents = "none";
    this.container.style.opacity = String(this.options.opacity);
  }

  private recalcLanes() {
    const laneHeight = this.options.fontSize + 8;
    const height = this.container.clientHeight || window.innerHeight;
    const count = Math.max(1, Math.floor(height / laneHeight));
    this.laneCount = count;
    if (this.laneReleaseAt.length < count) {
      this.laneReleaseAt.push(
        ...Array(count - this.laneReleaseAt.length).fill(0)
      );
    } else if (this.laneReleaseAt.length > count) {
      this.laneReleaseAt.length = count;
    }
  }

  private tick = () => {
    if (this.destroyed) return;
    this.pruneExpired();
    this.shedStaleQueue();
    this.spawnWhilePossible();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private pruneExpired() {
    const now = performance.now();
    this.active = this.active.filter(({ el, endAt }) => {
      if (now >= endAt) {
        el.remove();
        return false;
      }
      return true;
    });

    while (this.active.length > this.options.maxActive) {
      const oldest = this.active.shift();
      oldest?.el.remove();
    }
  }

  private shedStaleQueue() {
    const now = performance.now();
    this.queue = this.queue.filter(
      (item) => now - item.enqueuedAt <= this.options.maxWaitMs
    );
  }

  private dequeueNext(): QueuedItem | undefined {
    if (this.queue.length === 0) return undefined;
    // 队列积压时优先展示最新弹幕，避免新消息被旧消息堵住
    if (this.queue.length > 15) {
      return this.queue.pop();
    }
    return this.queue.shift();
  }

  private spawnWhilePossible() {
    const containerWidth = this.container.clientWidth;
    if (containerWidth <= 0) return;

    let guard = 0;
    while (this.queue.length > 0 && guard++ < 8) {
      if (this.active.length >= this.options.maxActive) break;

      const lane = this.findAvailableLane();
      if (lane < 0) break;

      const item = this.dequeueNext();
      if (!item) break;
      this.spawnBullet(item, lane, containerWidth);
    }
  }

  private findAvailableLane(): number {
    const now = performance.now();
    for (let i = 0; i < this.laneCount; i++) {
      if (this.laneReleaseAt[i] <= now) return i;
    }
    return -1;
  }

  private spawnBullet(item: QueuedItem, lane: number, containerWidth: number) {
    const el = document.createElement("div");
    el.textContent = item.text;
    el.className = "danmaku-item";
    el.style.cssText = [
      "position:absolute",
      "top:0",
      "left:0",
      "white-space:nowrap",
      "font-weight:bold",
      "line-height:1",
      "will-change:transform",
      `font-size:${this.options.fontSize}px`,
      `color:${item.color}`,
      "text-shadow:1px 1px 2px rgba(0,0,0,0.85)",
    ].join(";");

    this.container.appendChild(el);

    const width = el.offsetWidth;
    const laneHeight = this.options.fontSize + 8;
    const y = lane * laneHeight + 4;
    const startX = containerWidth;
    const endX = -width;
    const distance = startX - endX;
    const durationMs = (distance / this.options.speed) * 1000;
    const minGap = this.options.density;
    const gapDurationMs = ((width + minGap) / this.options.speed) * 1000;
    const now = performance.now();

    el.style.transform = `translate(${startX}px, ${y}px)`;

    el.animate(
      [
        { transform: `translate(${startX}px, ${y}px)` },
        { transform: `translate(${endX}px, ${y}px)` },
      ],
      {
        duration: durationMs,
        easing: "linear",
        fill: "forwards",
      }
    );

    this.laneReleaseAt[lane] = now + gapDurationMs;
    this.active.push({ el, lane, endAt: now + durationMs + 50 });
  }
}
