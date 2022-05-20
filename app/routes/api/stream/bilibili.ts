import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Bilibili } from "~/utils/libs/reallive/bilibili/reallive";

export const action: ActionFunction = async ({request}) => {
    const { rid, type, qn } = await request.json();
    const stream = await getRealLive_Bilibili(rid, qn || "原画", type || "flv");
    return {
        stream
    };
}