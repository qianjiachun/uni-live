import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Douyu } from "~/utils/libs/reallive/douyu/reallive";


export const action: ActionFunction = async ({request}) => {
    const {rid, param, qn, type} = await request.json();
    let postData = `${param}&ver=219032101&rid=${rid}`;
    let stream = await getRealLive_Douyu(postData, qn || "原画", type || "flv");
    return {
        stream
    };
}