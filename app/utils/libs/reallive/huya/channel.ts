import axios from "axios";
import { getStrMiddle } from "~/utils";


export function getChannelInfo_Huya(room_id: string): Promise<IHuyaChannelInfo> {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.huya.com/${room_id}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "User-Agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Mobile Safari/537.36;"
      }
    })
      .then((ret) => {
        let channelId = getStrMiddle(ret.data, `lChannelId":`, `,`);
        let subChannelId = getStrMiddle(ret.data, `lSubChannelId":`, `,`);
        resolve({
          channelId,
          subChannelId
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
