import axios from "axios";

export function apiGetDouyuRealRid(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.post(`/api/rid/douyu`, JSON.stringify({
      rid,
    }))
      .then((ret) => {
        resolve(ret.data.rid);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetDouyuScript(rid: string): Promise<IDouyuScript> {
  return new Promise((resolve, reject) => {
    axios.post(`/api/stream/douyuScript`, JSON.stringify({
      rid,
    }))
      .then((ret) => {
        resolve({
            script: ret.data.script,
            rid: ret.data.rid,
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
    axios.post(`/api/stream/douyu`, JSON.stringify({
      rid,
      param,
      qn: qn || "原画",
      type: type || "flv",
    }))
      .then((ret) => {
        resolve(ret.data.stream);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetHuyaStream(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.post(`/api/stream/huya`, JSON.stringify({
      rid,
    }))
      .then((ret) => {
        resolve(ret.data.stream);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetBilibiliStream(rid: string, qn: IQnType, type: IStreamType): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.post(`/api/stream/bilibili`, JSON.stringify({
      rid,
      type: type || "flv",
      qn: qn || "原画",
    }))
      .then((ret) => {
        console.log(ret);
        resolve(ret.data.stream);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetBilibiliRealRid(rid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.post(`/api/rid/bilibili`, JSON.stringify({
      rid,
    }))
      .then((ret) => {
        resolve(ret.data.rid);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function apiGetHuyaChannelInfo(rid: string): Promise<IHuyaChannelInfo> {
  return new Promise((resolve, reject) => {
    axios.post(`/api/rid/huyaChannelInfo`, JSON.stringify({
      rid,
    }))
      .then((ret) => {
        resolve(ret.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}