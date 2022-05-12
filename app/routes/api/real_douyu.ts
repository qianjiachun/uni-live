import type { ActionFunction } from "@remix-run/node";
import { getRealLive_Douyu } from "~/utils/libs/reallive/douyu/reallive";



export const action: ActionFunction = async ({request}) => {
    let ret = null;
    let formData = await request.formData();
    let param = formData.get("param");
    let qn = formData.get("qn") as string;
    let rid = formData.get("rid");
    let postData = `${param}&ver=219032101&rid=${rid}&rate=${qn}`;
    let stream = await getRealLive_Douyu(postData, qn);
    ret = {
        type: "stream_douyu",
        src: `https://www.douyu.com/${rid}`,
        stream
    }
    return ret;
}