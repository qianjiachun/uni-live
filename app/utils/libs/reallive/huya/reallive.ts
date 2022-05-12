import { atob } from "@remix-run/node/base64";
import { getStrMiddle } from "~/utils";

export function getRealLive_Huya(room_id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(`https://www.huya.com/${room_id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
      },
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
