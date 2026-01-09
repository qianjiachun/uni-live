import axios from "axios";
import { eval1 } from "~/utils";

export const QN_DOUYU: any = {
  原画: "0",
  蓝光: "8",
  超清: "4",
  高清: "3",
  流畅: "2",
};

function md5Hex(input: string): string {
  const md5Fn = (globalThis as any)?.md5;
  if (typeof md5Fn === "function") return md5Fn(input);

  const rotateLeft = (x: number, c: number) => (x << c) | (x >>> (32 - c));
  const addUnsigned = (a: number, b: number) => (a + b) >>> 0;
  const toWordArray = (str: string) => {
    const utf8 = unescape(encodeURIComponent(str));
    const len = utf8.length;
    const words: number[] = [];
    for (let i = 0; i < len; i++) {
      words[i >> 2] = words[i >> 2] || 0;
      words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    }
    words[len >> 2] = words[len >> 2] || 0;
    words[len >> 2] |= 0x80 << ((len % 4) * 8);
    words[(((len + 8) >>> 6) << 4) + 14] = len * 8;
    return words;
  };
  const wordToHex = (value: number) => {
    let hex = "";
    for (let i = 0; i < 4; i++) {
      const byte = (value >>> (i * 8)) & 0xff;
      hex += ("0" + byte.toString(16)).slice(-2);
    }
    return hex;
  };

  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);

  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  const x = toWordArray(input);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;

    a = FF(a, b, c, d, x[k + 0] || 0, 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1] || 0, 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2] || 0, 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3] || 0, 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4] || 0, 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5] || 0, 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6] || 0, 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7] || 0, 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8] || 0, 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9] || 0, 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10] || 0, 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11] || 0, 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12] || 0, 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13] || 0, 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14] || 0, 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15] || 0, 22, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1] || 0, 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6] || 0, 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11] || 0, 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0] || 0, 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5] || 0, 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10] || 0, 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15] || 0, 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4] || 0, 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9] || 0, 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14] || 0, 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3] || 0, 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8] || 0, 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13] || 0, 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2] || 0, 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7] || 0, 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12] || 0, 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5] || 0, 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8] || 0, 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11] || 0, 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14] || 0, 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1] || 0, 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4] || 0, 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7] || 0, 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10] || 0, 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13] || 0, 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0] || 0, 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3] || 0, 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6] || 0, 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9] || 0, 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12] || 0, 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15] || 0, 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2] || 0, 23, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0] || 0, 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7] || 0, 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14] || 0, 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5] || 0, 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12] || 0, 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3] || 0, 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10] || 0, 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1] || 0, 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8] || 0, 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15] || 0, 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6] || 0, 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13] || 0, 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4] || 0, 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11] || 0, 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2] || 0, 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9] || 0, 21, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

function getDouyuRealLiveAuth(
  rid: string,
  did: string,
  ts: number,
  key: string,
  randStr: string,
  encTime: number,
  isSpecial: number
): string {
  const i = isSpecial === 1 ? "" : `${rid}${ts}`;
  let f = randStr;
  for (let p = 0; p < encTime; p++) f = md5Hex(f + key);
  return md5Hex(f + key + i);
}

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
  qn: IQnType,
  type: IStreamType
): Promise<string> {
  return new Promise((resolve, reject) => {
    const did = "10000000000000000000000000001501";
    axios.get(`https://www.douyu.com/wgapi/livenc/liveweb/websec/getEncryption?did=${did}`, {
      headers: {
        Referer: `https://www.douyu.com/${rid}`,
      },
    }).then((encRes) => {
      const encRet = encRes.data;
      if (!encRet || encRet.error !== 0) {
        resolve("");
        return;
      }
      const d = encRet.data;
      const ts = Math.round(Date.now() / 1000);
      const auth = getDouyuRealLiveAuth(rid, did, ts, d.key, d.rand_str, d.enc_time, d.is_special);
      const rate = QN_DOUYU[qn] === "1428" ? "-1" : QN_DOUYU[qn];
      const postData = new URLSearchParams({
        enc_data: d.enc_data,
        tt: String(ts),
        did,
        auth,
        cdn: "",
        rate,
        hevc: "0",
        fa: "0",
        ive: "0",
      }).toString();

      axios.post(`https://www.douyu.com/lapi/live/getH5PlayV1/${rid}`, postData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: `https://www.douyu.com/${rid}`,
        },
      }).then((res) => {
        const ret = res.data;
        let realLive = "";
        if (ret?.error === 0) {
          if (type === "hls" && ret.data?.hls_url && ret.data?.hls_live) {
            realLive = `${ret.data.hls_url}/${ret.data.hls_live}`;
          } else {
            realLive = `${ret.data.rtmp_url}/${ret.data.rtmp_live}`;
          }
        }
        resolve(realLive);
      }).catch(reject);
    }).catch(reject);
  });
}


export function getDouyuScriptParam(rid: string, script: string): string {
  try {
    if (!script || script.trim().length < 10) return "";
    eval1(script, "exScript1");
    let tt = Math.round(new Date().getTime() / 1000).toString();
    let param = window.ub98484234(rid, "10000000000000000000000000001501", tt);
    let scriptDom = document.getElementById("exScript1");
    if (scriptDom) {
      scriptDom.remove();
    }
    return param;
  } catch (e) {
    let scriptDom = document.getElementById("exScript1");
    if (scriptDom) {
      scriptDom.remove();
    }
    return "";
  }
}
