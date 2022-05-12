import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Huya } from "~/utils/libs/reallive/huya/reallive";

export const action: ActionFunction = async ({request}) => {
    let ret = null;
    let formData = await request.formData();
    let rid = formData.get("rid") as string;

    let stream = await getRealLive_Huya(rid);
    ret = {
        type: "stream_huya",
        src: `https://www.huya.com/${rid}`,
        stream
    }
    return ret;
}