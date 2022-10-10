import axios from "axios";

export function getRealLive_Huya(room_id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.get(`https://mp.huya.com/cache.php?m=Live&do=profileRoom&roomid=${room_id}`, {
    })
      .then((ret) => {
        let liveUrl = "";
        let multiLine = ret.data.data?.stream?.flv?.multiLine;
        if (multiLine.length > 0) {
          liveUrl = multiLine[0].url;
        }
        resolve(liveUrl);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
