// 斗鱼获取真实房间号
export function getRealRid_Douyu(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch("https://wxapp.douyucdn.cn/Live/Room/info/" + rid, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
        resolve(ret.data.room_id);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
