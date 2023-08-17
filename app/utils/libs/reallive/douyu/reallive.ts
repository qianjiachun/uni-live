import axios from "axios";
import { eval1 } from "~/utils";

export const QN_DOUYU: any = {
  原画: "0",
  蓝光: "8",
  超清: "4",
  高清: "3",
  流畅: "2",
};
export function getRealLive_DouyuScript(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.get("https://www.douyu.com/" + rid, {
    })
      .then((ret) => {
        let ub9 = "";
        let a = ret.data.match(/(vdwdae325w_64we[\s\S]*?function ub98484234[\s\S]*?)function/i);
        if (a) {
          ub9 = a[1];
        }
        resolve(ub9);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getRealLive_Douyu(
  rid: string,
  data: string,
  qn: IQnType,
  type: IStreamType
): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.post(`https://www.douyu.com/lapi/live/getH5Play/${rid}`, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((res) => {
        let ret = res.data;
        let realLive = "";
        if (ret.error === 0) {
            realLive = `${ret.data.rtmp_url}/${ret.data.rtmp_live}`;
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