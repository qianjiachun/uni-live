import axios from "axios";
import { eval1 } from "~/utils";

const QN_DOUYU = {
  原画: "0",
  蓝光: "4000p",
  超清: "2000p",
  高清: "1200p",
  流畅: "550p",
};
export function getRealLive_DouyuScript(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.get("https://m.douyu.com/" + rid, {
    })
      .then((ret) => {
        let ub9 = "";
        let a = ret.data.match(/(function ub9.*)[\s\S](var.*)/i);
        if (a) {
          ub9 = a[0];
        }
        resolve(ub9);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getRealLive_Douyu(
  data: string,
  qn: IQnType,
  type: IStreamType
): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.post("https://m.douyu.com/api/room/ratestream", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((res) => {
        let ret = res.data;
        let result = "";
        if (ret.code == "0") {
          let url = ret.data.url;
          if (String(url).indexOf("mix=1") != -1) {
            result = "PKing";
          } else {
            let p = /^[0-9a-zA-Z]*/;
            let tmpArr = String(ret.data.url).split("/");
            let tmpResult = tmpArr[tmpArr.length - 1].match(p);
            if (tmpResult) {
              result = tmpResult[0];
            }
          }
        } else {
          result = "0";
        }
        let cl = QN_DOUYU[qn];
        let realLive = "";
        if (result == "0") {
          realLive = "";
        } else {
          realLive = String(ret.data.url).replace("m3u8", "flv");
          realLive = realLive.replace("http:", "https:");
          // if (cl === "0") {
          //   realLive = `https://openhls-tct.douyucdn2.cn/dyliveflv1/${result}.m3u8?uuid=`;
          // } else {
          //   realLive = `https://openhls-tct.douyucdn2.cn/dyliveflv1/${result}_${cl}.m3u8?uuid=`;
          // }
          // if (type === "flv") {
          //   // realLive = String(ret.data.url).replace("m3u8", "flv");
			    //   realLive = String(realLive).replace("m3u8", "flv");
          // }
        }
        resolve(realLive);
      })
      .catch((err) => {
        reject(err);
      });
  });
}


export function getDouyuScriptParam(rid: string, script: string): string {
  eval1(script, "exScript1");
  let tt = Math.round(new Date().getTime()/1000).toString();
  let param = window.ub98484234(rid, "10000000000000000000000000001501", tt);
  let scriptDom = document.getElementById("exScript1");
  if (scriptDom) {
    scriptDom.remove();
  }
  return param;;
}