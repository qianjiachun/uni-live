import type { ActionFunction } from "@remix-run/node";
import { getRealRid_Bilibili } from "~/utils/libs/reallive/bilibili/realrid";

export const action: ActionFunction = async ({request}) => {
    const {rid} = await request.json();
    let realRid = await getRealRid_Bilibili(rid);
    return {
        rid: realRid
    };
}