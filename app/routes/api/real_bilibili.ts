import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Bilibili } from "~/utils/libs/reallive/bilibili/reallive";

export const action: ActionFunction = async ({request}) => {
    let ret = null;
    let formData = await request.formData();
    let rid = formData.get("rid") as string;
    let qn = formData.get("qn") as string;

    let stream = await getRealLive_Bilibili(rid, qn);
    ret = {
        type: "stream_bilibili",
        src: `https://live.bilibili.com/${rid}`,
        stream
    }
    return ret;
}