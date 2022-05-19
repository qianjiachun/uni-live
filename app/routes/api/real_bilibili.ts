import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Bilibili, QN_BILIBILI } from "~/utils/libs/reallive/bilibili/reallive";


export const action: ActionFunction = async ({request}) => {
    let ret = null;
    let formData = await request.formData();
    let rid = formData.get("rid") as string;
    let qn = QN_BILIBILI[formData.get("qn") as string];
    let url = formData.get("url") as string;
    let type = formData.get("type") as IStreamType;

    let stream = await getRealLive_Bilibili(rid, qn, type);
    ret = {
        type: "stream",
        url,
        rid,
        stream,
        qnName: formData.get("qn") as string
    }
    return ret;
}