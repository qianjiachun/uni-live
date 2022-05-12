import type { ActionFunction } from "@remix-run/node";
import { getRealLive_DouyuScript } from "~/utils/libs/reallive/douyu/reallive";
import { getRealRid_Douyu } from "~/utils/libs/reallive/douyu/realrid";


export const action: ActionFunction = async ({request}) => {
    let ret = null;
    const formData = await request.formData();
    const rid = formData.get("rid") as string;
    let realRid = await getRealRid_Douyu(rid);
    let script = await getRealLive_DouyuScript(realRid);
    ret = {
        type: "douyuScript",
        rid: realRid,
        script,
        qn: formData.get("qn") as string
    }
    return ret;
}
