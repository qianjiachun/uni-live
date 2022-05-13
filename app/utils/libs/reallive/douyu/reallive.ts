export const QN_DOUYU: any = {
	"原画": "0",
	"蓝光": "4000p",
	"超清": "2000p",
	"高清": "1200p",
	"流畅": "550p"
};
export function getRealLive_DouyuScript(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch("https://m.douyu.com/" + rid, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        return res.text();
      })
      .then((ret) => {
        let ub9 = "";
        let a = ret.match(/(function ub9.*)[\s\S](var.*)/i);
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

export function getRealLive_Douyu(data: string, qn: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch("https://m.douyu.com/api/room/ratestream", {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
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
			if (cl === "0") {
				realLive = "https://akm-tct.douyucdn.cn/live/" + result + ".flv?uuid=";
			} else {
				realLive = "https://akm-tct.douyucdn.cn/live/" + result + "_" + cl + ".flv?uuid=";
			}
          
        //   realLive = String(ret.data.url).replace("m3u8", "flv");
        }
        resolve(realLive);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
