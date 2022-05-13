import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Huya } from "~/utils/libs/reallive/huya/reallive";

export const action: ActionFunction = async ({request}) => {
    let ret = null;
    let formData = await request.formData();
    let rid = formData.get("rid") as string;
    let url = formData.get("url") as string;

    let stream = await getRealLive_Huya(rid);
    ret = {
        type: "stream",
        url,
        rid,
        stream
    }
    return ret;
}