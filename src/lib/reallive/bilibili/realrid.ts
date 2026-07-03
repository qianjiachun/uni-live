import axios from "axios";

export function getRealRid_Bilibili(rid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      axios.get("https://api.live.bilibili.com/room/v1/Room/room_init?id=" + rid)
        .then((ret) => {
          resolve(ret.data.data.room_id);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  