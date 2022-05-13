import type { ActionFunction } from "@remix-run/node";
import { getRealRid_Douyu } from "~/utils/libs/reallive/douyu/realrid";


export const action: ActionFunction = async ({request}) => {
    let ret = null;
    const formData = await request.formData();
    const rid = formData.get("rid") as string;
    let realRid = await getRealRid_Douyu(rid);
    ret = {
        type: "douyu_rid",
        rid: realRid,
        url: formData.get("url") as string
    }
    return ret;
}
