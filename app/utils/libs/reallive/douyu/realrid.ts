import axios from "axios";

// 斗鱼获取真实房间号
export function getRealRid_Douyu(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.get("https://wxapp.douyucdn.cn/Live/Room/info/" + rid, {
    })
      .then((ret) => {
        resolve(ret.data.data.room_id);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
