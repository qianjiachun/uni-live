import type { ActionFunction } from "@remix-run/node";
import { getRealLive_DouyuScript } from "~/utils/libs/reallive/douyu/reallive";
import { getRealRid_Douyu } from "~/utils/libs/reallive/douyu/realrid";

export const action: ActionFunction = async ({request}) => {
    const {rid} = await request.json();
    let realRid = await getRealRid_Douyu(rid);
    let script = await getRealLive_DouyuScript(realRid);
    return {
        rid: realRid,
        script
    }
}