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
export function getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getStrMiddle(str: string, before: string, after: string) {
	let m = str.match(new RegExp(before + '(.*?)' + after));
	return m ? m[1] : "";
}

export function isRid(str: string) {
	if (/^[0-9]+$/.test(str)) {
		return true;
	} else {
		return false;
	}
}

// 解析url参数
export function parseUrlParams(url: string) {
    let params: any = {};
    let arr = url.split("?");
    if (arr.length > 1) {
        let str = arr[1];
        let arr1 = str.split("&");
        for (let i = 0; i < arr1.length; i++) {
            let arr2 = arr1[i].split("=");
            params[arr2[0]] = arr2[1];
        }
    }
    return params;
}

// 数组成员上移
export function arrayMoveUp(arr: any[], index: number) {
    let ret = arr;
    if (index > 0) {
        let temp = ret[index - 1];
        ret[index - 1] = ret[index];
        ret[index] = temp;
    }
    return ret;
}

// 数组成员下移
export function arrayMoveDown(arr: any[], index: number) {
    let ret = arr;
    if (index < ret.length - 1) {
        let temp = ret[index + 1];
        ret[index + 1] = ret[index];
        ret[index] = temp;
    }
    return ret;
}

// deep copy array
export function deepCopyArray(arr: any[]) {
    let ret: any[] = [];
    for (let i = 0; i < arr.length; i++) {
        ret.push(arr[i]);
    }
    return ret;
}

export function sleep(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}


export function injectStyle(styleName: any, styleText: any) {
    if (document.getElementById(styleName) == null) {
        let styleElement = document.createElement("style");
        styleElement.id = styleName;
        styleElement.innerHTML = styleText;
        document.body.append(styleElement);
    }
}