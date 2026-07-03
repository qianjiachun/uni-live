export const getLastField = (url: string): string => {
  let ret = url.split("/").pop() ?? "";
  ret = ret.split("?")[0];
  return ret;
};

export function getStrMiddle(str: string, before: string, after: string) {
  const m = str.match(new RegExp(before + "(.*?)" + after));
  return m ? m[1] : "";
}

export function isRid(str: string) {
  return /^[0-9]+$/.test(str);
}

export function parseUrlParams(url: string) {
  const params: Record<string, string> = {};
  const arr = url.split("?");
  if (arr.length > 1) {
    const pairs = arr[1].split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      params[key] = value;
    }
  }
  return params;
}

export function arrayMoveUp<T>(arr: T[], index: number): T[] {
  const ret = [...arr];
  if (index > 0) {
    [ret[index - 1], ret[index]] = [ret[index], ret[index - 1]];
  }
  return ret;
}

export function arrayMoveDown<T>(arr: T[], index: number): T[] {
  const ret = [...arr];
  if (index < ret.length - 1) {
    [ret[index + 1], ret[index]] = [ret[index], ret[index + 1]];
  }
  return ret;
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function detectPlatform(url: string): import("@/types").Platform {
  if (url.length > 150) return "direct";
  if (url.includes("douyu.com")) return "douyu";
  if (url.includes("bilibili.com")) return "bilibili";
  if (url.includes("huya.com")) return "huya";
  return "unknown";
}

export function detectStreamType(): import("@/types").IStreamType {
  if (typeof navigator === "undefined") return "flv";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("mac")) {
    return "hls";
  }
  return "flv";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
