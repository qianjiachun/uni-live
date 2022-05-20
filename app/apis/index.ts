export function apiGetDouyuRealRid(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(`/api/rid/douyu`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        rid,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
        resolve(ret.rid);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetDouyuScript(rid: string): Promise<IDouyuScript> {
  return new Promise((resolve, reject) => {
    fetch(`/api/stream/douyuScript`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        rid,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
        resolve({
            script: ret.script,
            rid: ret.rid,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetDouyuStream(
  rid: string,
  param: string,
  qn: IQnType,
  type: IStreamType
): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(`/api/stream/douyu`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        rid,
        param,
        qn: qn || "原画",
        type: type || "flv",
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
        resolve(ret.stream);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetHuyaStream(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(`/api/stream/huya`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        rid,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
        resolve(ret.stream);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetBilibiliStream(rid: string, qn: IQnType, type: IStreamType): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(`/api/stream/bilibili`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        rid,
        type: type || "flv",
        qn: qn || "原画",
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((ret) => {
        resolve(ret.stream);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
