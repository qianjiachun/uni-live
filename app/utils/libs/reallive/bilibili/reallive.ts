import axios from "axios";

const QN_BILIBILI = {
	"原画": "20000",
	"蓝光": "400",
	"超清": "250",
	"高清": "150",
	"流畅": "80"
};

// export function getRealLive_Bilibili(
//   room_id: string,
//   qn: IQnType,
//   type: IStreamType
// ): Promise<string> {
//   return new Promise((resolve, reject) => {
//     axios.get(
//       `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${room_id}&protocol=0,1&format=0,1,2&codec=0,1&qn=${QN_BILIBILI[qn]}&platform=h5&ptype=8`,
//     )
//       .then((res) => {
//         let ret = res.data;
//         let rurl = "";
//         let streamList = ret.data?.playurl_info?.playurl?.stream;
//         if (streamList) {
//           let hlsInfo = streamList.length > 0 ? streamList[type === "flv" ? 0 : streamList.length - 1]?.format[0]?.codec[0] : null;
//           if (hlsInfo) {
//             rurl = `${hlsInfo?.url_info[0]?.host}${hlsInfo?.base_url}${hlsInfo?.url_info[0]?.extra}`;
//           }
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
  qn: IQnType,
  type: IStreamType
): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.get(
      "https://api.live.bilibili.com/room/v1/Room/playUrl?cid=" + room_id + "&qn=" + QN_BILIBILI[qn] + "&platform=web",
    )
      .then((res) => {
        let ret = res.data;
        let rurl = "";
        let streamList = ret.data?.durl;
        if (streamList) {
          rurl = streamList.length > 0 ? streamList[0].url : "";
        }
        resolve(rurl);
      })
      .catch((err) => {
        reject(err);
      });
  });
}