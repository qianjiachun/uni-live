// import { getRandom } from "~/utils";
export const QN_BILIBILI: any = {
	"原画": "10000",
	"蓝光": "400",
	"超清": "250",
	"高清": "150",
	"流畅": "80"
};

// export function getRealLive_Bilibili(
//   room_id: string,
//   qn: string
// ): Promise<string> {
//   return new Promise((resolve, reject) => {
//     fetch(
//       `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${room_id}&qn=${qn}&platform=web`,
//       {
//         method: "GET",
//         credentials: "include",
//       }
//     )
//       .then((res) => {
//         return res.json();
//       })
//       .then((ret) => {
//         let rurl = "";
//         if (ret.data.durl != null && ret.data.durl.length > 0) {
//           rurl = ret.data.durl[getRandom(0, ret.data.durl.length - 1)].url;
//         } else {
//           rurl = "";
//         }
//         resolve(rurl);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// }

export function getRealLive_Bilibili(
  room_id: string,
  qn: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${room_id}&protocol=0,1&format=0,1,2&codec=0,1&qn=${qn}&platform=h5&ptype=8`,
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
        let streamList = ret.data?.playurl_info?.playurl?.stream;
        if (streamList) {
          let hlsInfo = streamList.length > 0 ? streamList[streamList.length - 1]?.format[0]?.codec[0] : null;
          if (hlsInfo) {
            rurl = `${hlsInfo?.url_info[0]?.host}${hlsInfo?.base_url}`;
          }
        }
        resolve(rurl);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
