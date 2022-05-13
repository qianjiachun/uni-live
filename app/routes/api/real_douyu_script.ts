import type { ActionFunction } from "@remix-run/node";
import { getRealLive_DouyuScript } from "~/utils/libs/reallive/douyu/reallive";
import { getRealRid_Douyu } from "~/utils/libs/reallive/douyu/realrid";


export const action: ActionFunction = async ({request}) => {
    let ret = null;
    const formData = await request.formData();
    const rid = formData.get("rid") as string;
    let url = formData.get("url") as string;
    let realRid = await getRealRid_Douyu(rid);
    let script = await getRealLive_DouyuScript(realRid);
    let qn = formData.get("qn") as string;
    ret = {
        type: "script",
        url,
        rid: realRid,
        script,
        qn
    }
    return ret;
}
