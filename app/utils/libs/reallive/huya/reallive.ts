import { atob } from "@remix-run/node/base64";
import { getStrMiddle } from "~/utils";

export function getRealLive_Huya(room_id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(`https://www.huya.com/${room_id}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "User-Agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) "
      }
    })
      .then((res) => {
        return res.text();
      })
      .then((ret) => {
        let liveUrl = getStrMiddle(ret, `liveLineUrl":"`, `",`);
        liveUrl = atob(liveUrl);
        liveUrl = "https:" + liveUrl;
        liveUrl = String(liveUrl).replace("hls", "flv").replace("m3u8", "flv");
        resolve(liveUrl);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
