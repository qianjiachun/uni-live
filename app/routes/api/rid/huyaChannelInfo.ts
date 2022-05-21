import type { ActionFunction } from "@remix-run/node";
import { getChannelInfo_Huya } from "~/utils/libs/reallive/huya/channel";

export const action: ActionFunction = async ({request}) => {
    const {rid} = await request.json();
    let {channelId, subChannelId} = await getChannelInfo_Huya(rid);
    return {
        channelId,
        subChannelId
    }
}