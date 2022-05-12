export const getLastField = (url: string): string => {
    let ret = "";
    let fields = url.split("/");
    ret = fields[fields.length - 1];
    fields = ret.split("?");
    ret = fields[0];
    return ret;
}

export function eval1(str: string, iid: string) {
    let sc = document.createElement("script");
    sc.id = iid
    sc.setAttribute("type","text\/javascript");
    sc.appendChild(document.createTextNode(str));
    document.body.appendChild(sc);
}

// 取随机整数   
export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getStrMiddle(str: string, before: string, after: string) {
	let m = str.match(new RegExp(before + '(.*?)' + after));
	return m ? m[1] : "";
}