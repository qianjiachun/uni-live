import type { ActionFunction } from "@remix-run/node";
import { QN_DOUYU, getRealLive_Douyu } from "~/utils/libs/reallive/douyu/reallive";


export const action: ActionFunction = async ({request}) => {
    const {rid, param, qn, type} = await request.json();
    let postData = `${param}&ver=219032101&cdn=tct-h5&rid=${rid}&rate=${QN_DOUYU[qn || `原画`]}`;
    let stream = await getRealLive_Douyu(rid, postData, qn || "原画", type || "flv");
    return {
        stream
    };
}