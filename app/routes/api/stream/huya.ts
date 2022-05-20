import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Huya } from "~/utils/libs/reallive/huya/reallive";

export const action: ActionFunction = async ({request}) => {
    const {rid} = await request.json();
    let stream = await getRealLive_Huya(rid);
    return {
        stream
    }
}
