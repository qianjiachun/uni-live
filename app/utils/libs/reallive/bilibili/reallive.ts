import { getRandomInt } from "~/utils";

export function getRealLive_Bilibili(
  room_id: string,
  qn: string
): Promise<string> {
  const QN: any = {
    "1": "80",
    "2": "150",
    "3": "250",
    "4": "400",
    "5": "10000",
  };
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${room_id}&qn=${QN[qn]}&platform=web`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
        let rurl = "";
        if (ret.data.durl != null && ret.data.durl.length > 0) {
          rurl = ret.data.durl[getRandomInt(0, ret.data.durl.length - 1)].url;
        } else {
          rurl = "";
        }
        resolve(rurl);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
