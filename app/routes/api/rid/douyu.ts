import type { ActionFunction } from "@remix-run/node";
import { getRealRid_Douyu } from "~/utils/libs/reallive/douyu/realrid";

export const action: ActionFunction = async ({request}) => {
    const {rid} = await request.json();
    let realRid = await getRealRid_Douyu(rid);
    return {
        rid: realRid
    };
}