export function getRealRid_Bilibili(rid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch("https://api.live.bilibili.com/room/v1/Room/room_init?id=" + rid, {
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
  