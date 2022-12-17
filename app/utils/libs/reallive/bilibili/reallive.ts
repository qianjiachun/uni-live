import axios from "axios";

const QN_BILIBILI = {
  原画: "20000",
  蓝光: "400",
  超清: "250",
  高清: "150",
  流畅: "80"
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

export function getRealLive_Bilibili(room_id: string, qn: IQnType, type: IStreamType): Promise<string> {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${room_id}&platform=web&qn=${QN_BILIBILI[qn]}&protocol=0,1&format=0,1,2&codec=0,1`)
      .then((res) => {
        let ret = res.data;
        let rurl = "";
        for (let i = 0; i < ret.data.playurl_info.playurl.stream.length; i++) {
          const item = ret.data.playurl_info.playurl.stream[i];
          if (String(item.protocol_name).includes("hls") && item.format.length > 0) {
            let url_info = item.format[0].codec[0].url_info[0];
            let base_url = item.format[0].codec[0].base_url;
            rurl = `${url_info.host}${base_url}${url_info.extra}`;
          }
        }
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
