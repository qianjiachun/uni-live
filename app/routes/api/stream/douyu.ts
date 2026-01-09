import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Douyu } from "~/utils/libs/reallive/douyu/reallive";


export const action: ActionFunction = async ({request}) => {
    const {rid, qn, type} = await request.json();
    let stream = await getRealLive_Douyu(rid, qn || "原画", type || "flv");
    return {
        stream
    };
}
