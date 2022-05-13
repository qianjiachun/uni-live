import { getRandomInt } from "~/utils";
export const QN_BILIBILI: any = {
	"原画": "10000",
	"蓝光": "400",
	"超清": "250",
	"高清": "150",
	"流畅": "80"
};

export function getRealLive_Bilibili(
  room_id: string,
  qn: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${room_id}&qn=${qn}&platform=web`,
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
