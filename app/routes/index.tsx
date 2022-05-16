import { ArrowDown, ArrowUp, Cross, GuideO, Setting } from "@react-vant/icons";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import copy from "copy-to-clipboard";
import Danmaku from "rc-danmaku";
import { useEffect, useRef, useState } from "react";
import { Button, Field, Popup, Radio, Tabs, Toast, Cell, Dialog, Slider, Collapse } from "react-vant";
import stylesVant from "react-vant/lib/index.css";
import VideoItem from "~/components/VideoItem";
import { Ex_WebSocket_UnLogin } from "~/utils/libs/websocket";
import { STT } from "~/utils/libs/stt";
import { arrayMoveDown, arrayMoveUp, deepCopyArray, eval1, getLastField, getStrMiddle, injectStyle, isRid, parseUrlParams, sleep } from "~/utils";
import RGL, { WidthProvider } from "react-grid-layout"
import clsx from "clsx";
import useLatest from "~/hooks/useLatest";
const ReactGridLayout = WidthProvider(RGL);


export const links: LinksFunction = () => {
	return [
		{rel: "stylesheet", href: stylesVant},
	]
}

export const loader: LoaderFunction = ({request}) => {
	const url = new URL(request.url);
	const video = url.searchParams.get("video");
	const danmaku = url.searchParams.get("danmaku");
	return {
		shareVideoList: video,
		shareDanmakuList: danmaku
	}
}

const danmakuColor: any = {
    "2": "rgb(30,135,240)",
    "3": "rgb(122,200,75)",
    "6": "rgb(255,105,180)",
    "4": "rgb(255,127,0)",
    "5": "rgb(155,57,244)",
    "1": "rgb(255,0,0)",
}

const Index = () => {

	const {shareVideoList, shareDanmakuList} = useLoaderData();
	const [isShowSetting, setIsShowSetting] = useState<boolean>(false);
	// overlap重叠 line并列
	const [showType, setShowType] = useState<IShowType>("overlap");
	// 视频地址数组
	const [videoList, setVideoList] = useState<IVideo[]>([]);
	const [videoOrderList, setVideoOrderList] = useState<IVideoOrder[]>([]);
	const videoOrderListRef = useLatest<IVideoOrder[]>(videoOrderList);
	const [qnName, setQnName] = useState<string>("原画");

	// 每行个数
	const [lineCount, setLineCount] = useState<number>(2);

	const [videoUrl, setVideoUrl] = useState<string>("");
	const [danmakuUrl, setDanmakuUrl] = useState<string>("");
	const [isAddVideoLoading, setIsAddVideoLoading] = useState<boolean>(false);
	const [isConnectDanmakuLoading, setIsConnectDanmakuLoading] = useState<boolean>(false);

	const [danmakuList, setDanmakuList] = useState<IDanmaku[]>([]);
	const danmakuListRef = useLatest<IDanmaku[]>(danmakuList);

	const danmakuRef = useRef<Danmaku | null>(null);

	// 弹幕不透明度 0 - 100
	const [danmakuOpacity, setDanmakuOpacity] = useState<number>(90);

	const stt = new STT();
	const fetcher = useFetcher();
	const fetcherRid = useFetcher();

	const loadVideoList = async (list: any) => {
		let count = 0;
		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			addVideo(item.url, item.qnName);
			count++;
			while (count !== videoOrderListRef.current.length) {
				await sleep(500);
			}
		}
	}

	const loadDanmakuList = async (list: any) => {
		let count = 0;
		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			addDanmaku(item.url);
			count++;
			while (count !== danmakuListRef.current.length) {
				await sleep(500);
			}
		}
	}

	const loadLocalVideoList = () => {
		let local_videoOrderList = localStorage.getItem("videoOrderList");
		if (local_videoOrderList) {
			let list = JSON.parse(local_videoOrderList);
			loadVideoList(list);
		}
	}

	const loadLocalDanmakuList = () => {
		let local_danmakuList = localStorage.getItem("danmakuList");
		if (local_danmakuList) {
			let list = JSON.parse(local_danmakuList);
			loadDanmakuList(list);
		}
	}
	
	const loadShareVideoList = () => {
		let list = JSON.parse(decodeURIComponent(window.atob(shareVideoList)));
		if (list) {
			loadVideoList(list);
		}
	}

	const loadShareDanmakuList = () => {
		let list = JSON.parse(decodeURIComponent(window.atob(shareDanmakuList)));
		if (list) {
			loadDanmakuList(list);
		}
	}

	const initDanmaku = () => {
		const danmaku = new Danmaku("#danmaku", {
			opacity: danmakuOpacity / 100,
		});
    	danmakuRef.current = danmaku;
	}

	useEffect(() => {
		injectStyle("Global", `
		.bullet-item {z-index: 40 !important;}
		.bullet-item-text {font-size:1.5rem !important; font-weight: bold !important;}
		#danmaku{position:absolute !important}
		.react-grid-item>.react-resizable-handle::after{border:4px solid white !important}
		.react-grid-item.react-grid-placeholder{background-color:gray !important}
		`);
		initDanmaku();
		if (shareVideoList) {
			loadShareVideoList();
		} else {
			loadLocalVideoList();
		}
		if (shareDanmakuList) {
			loadShareDanmakuList();
		} else {
			loadLocalDanmakuList();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		const data = fetcher.data;
		if (!data) return;
		if ("type" in data && data.type === "script") {
			eval1(data.script, "exScript1");
			let tt = Math.round(new Date().getTime()/1000).toString();
			let param = window.ub98484234(data.rid, "10000000000000000000000000001501", tt);
			let scriptDom = document.getElementById("exScript1");
			if (scriptDom) {
				scriptDom.remove();
			}
			fetcher.submit({rid: data.rid, url: data.url, param, tt, qn: data.qn}, {action: "/api/real_douyu", method: "post"});
		} else {
			if (!data.stream || data.stream == "" || data.stream.length < 10) {
				Toast.fail("获取直播流失败，可能没有对应的清晰度或未开播");
				setIsAddVideoLoading(false);
				return;
			}
			let id = String(new Date().getTime());
			setVideoList((list) => [...list, {
				id,
				order: list.length - 1,
				url: data.url,
				rid: data.rid,
				stream: data.stream
			}]);
			setVideoOrderList(list => [...list, {id, url: data.url, qnName: data.qnName}]);
		}
		setIsAddVideoLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data])

	const getLocalVideoList = (videoOrderList: IVideoOrder[]) => {
		let data = [];
		for (let i = 0; i < videoOrderList.length; i++) {
			let obj = {
				url: videoOrderList[i].url,
				qnName: videoOrderList[i].qnName
			}
			data.push(obj);
		}
		return data;
	}

	const getLocalDanmakuList = (danmakuList: IDanmaku[]) => {
		let data = [];
		for (let i = 0; i < danmakuList.length; i++) {
			let obj = {
				url: danmakuList[i].url,
			}
			data.push(obj);
		}
		return data;
	}

	useEffect(() => {
		localStorage.setItem("videoOrderList", JSON.stringify(getLocalVideoList(videoOrderList)));
	}, [videoOrderList])

	useEffect(() => {
		localStorage.setItem("danmakuList", JSON.stringify(getLocalDanmakuList(danmakuList)));
	}, [danmakuList])


	const addVideo = (url: string, qnName: string) => {
		// 拿到视频地址，对视频地址解析，获得视频直播流地址
		// 添加到VideoList中去
		if (url === "") return;
		setIsAddVideoLoading(true);
		let rid = getLastField(url);
		if (url.includes("douyu.com")) {
			if (!isRid(rid)) {
				let queryObj = parseUrlParams(url);
				if (queryObj.rid) {
					rid = queryObj.rid;
				}
			}
			fetcher.submit({url, rid, qn: qnName}, {action: "/api/real_douyu_script", method: "post"});
		} else if (url.includes("bilibili.com")) {
			fetcher.submit({url, rid, qn: qnName}, {action: "/api/real_bilibili", method: "post"});
		} else if (url.includes("huya.com")) {
			fetcher.submit({url, rid, qn: qnName}, {action: "/api/real_huya", method: "post"});
		} else {
			let id = String(new Date().getTime());
			setVideoList((list) => [...list, {
				id,
				order: list.length - 1,
				url: url,
				rid: url,
				stream: url
			}]);
			setVideoOrderList(list => [...list, {id, url, qnName}]);
			setIsAddVideoLoading(false);
		}
	}

	const addDanmaku = (url: string) => {
		if (url === "" || !url) return;
		if (!url.includes("douyu.com")) return;
		setIsConnectDanmakuLoading(true);
		let rid = getLastField(url);
		if (!isRid(rid)) {
			let queryObj = parseUrlParams(url);
			if (queryObj.rid) {
				rid = queryObj.rid;
			}
		}
		fetcherRid.submit({rid, url}, {action: "/api/real_douyu_rid", method: "post"});
	}

	useEffect(() => {
		const data = fetcherRid.data;
		if (!data) return;
		if ("type" in data && data.type === "douyu_rid") {
			let ws: any = new Ex_WebSocket_UnLogin(data.rid, (msg: string) => {
				msgHandler(msg);
			}, () => {
				closeWs(ws);
			});
			setDanmakuList(list => [...list, {id: String(new Date().getTime()),url: data.url, ws}]);
		}
		setIsConnectDanmakuLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcherRid.data])

	const closeWs = (ws: any) => {
		ws?.close();
		ws = null;
	}

	const msgHandler = (msg: string) => {
		let msgType = getStrMiddle(msg, "type@=", "/");
		if (msgType === "chatmsg") {
			let data: any = stt.deserialize(msg);
			danmakuRef.current?.emit(data.txt, {
				color: danmakuColor[data.col]
			});
		}
	}

	useEffect(() => {
		let tmpArr = deepCopyArray(videoList);
		for (let i = 0; i < videoOrderList.length; i++) {
			let item = videoOrderList[i];
			for (let j = 0; j < videoList.length; j++) {
				if (videoList[j].id === item.id) {
					tmpArr[j].order = i;
					break;
				}
			}
		}
		setVideoList(tmpArr);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoOrderList])

	const deletVideo = (id: string) => {
		setVideoList((list) => list.filter(item => item.id !== id));
	}

	const onClickShare = () => {
		let url = location.origin;
		url += url.includes("?") ? "&video=" : "?video=";
		url += window.btoa(encodeURIComponent(JSON.stringify(getLocalVideoList(videoOrderList))));
		url += "&danmaku=" + window.btoa(encodeURIComponent(JSON.stringify(getLocalDanmakuList(danmakuList))));
		Dialog.confirm({
			title: '是否复制分享链接',
			message: '保存当前的视频列表，再次访问会自动添加',
		})
		.then(() => {
			copy(url);
		}).catch(() => {});
	}

	const getLastVideoId = () => {
		return videoOrderListRef.current[videoOrderListRef.current.length - 1].id;
	}
	const getVideoStreamById = (id: string): string => {
		for (let i = 0; i < videoList.length; i++) {
			let item = videoList[i];
			if (item.id === id) {
				return item.stream
			}
		}
		return "";
	}

	
	return (
		<div className="w-full h-full bg-black">
			<div id="danmaku" className="w-full h-full absolute"></div>
			{/* 视频区 */}
			<div className="videolist w-full h-full">
				<ReactGridLayout
				className="overlap flex flex-wrap bg-black"
				cols={lineCount}>
					{videoList.map(item => {
						return (
							<div style={{
								flex: `${lineCount ? "0 0 " + String(100/lineCount) + "%" : ""}`,
								position: `${showType === "overlap" ? "absolute" : "inherit"}`,
								display: `${showType === "overlap" ? item.id === getLastVideoId() ? "block" : "none" : "block"}`,
							}} key={item.id} className={clsx([showType === "overlap" && "overlap", showType === "line" && "line-item ", "w-full h-full"])}>
								<VideoItem style={{
									height: "100%",
									width: "100%",
									// height: `${showType === "overlap" ? "100%" : "auto"}`,
									// width: `${showType === "overlap" ? "100%" : "auto"}`,
								}} url={item.url} order={item.order} src={item.stream}></VideoItem>
							</div>
							
						)
					})}
				</ReactGridLayout>
				{/* {videoList.map(item => {
					return (
						<VideoItem style={{
							flex: `${lineCount ? "0 0 " + String(100/lineCount) + "%" : ""}`,
							position: `${showType === "overlap" ? "absolute" : "inherit"}`,
							height: `${showType === "overlap" ? "100%" : "auto"}`,
							width: `${showType === "overlap" ? "100%" : "auto"}`,
							display: `${showType === "overlap" ? item.id === getLastVideoId() ? "block" : "none" : "block"}`,
						}} key={item.id} url={item.url} order={item.order} src={item.stream}></VideoItem>
					)
				})} */}
			</div>
			{/* 设置 */}
			<Popup className="popup overflow-hidden" visible={isShowSetting} position="bottom" style={{height: "50%"}} onClose={() => setIsShowSetting(false)}>
				<div className="popup-top">
					<div className="douyuex">
						<a href="https://xiaochunchun.gitee.io/douyuex/" target="_blank" rel="noreferrer">
							<svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2978" width="24" height="24"><path d="M1006.1 412.7l-187.5-141c0-0.2 0.1-0.3 0.1-0.4V121.4c0-2.3-1.9-4.2-4.2-4.2h-92.4c-2.3 0-4.2 1.9-4.2 4.2V196L535.3 58.8c-7.3-5.5-16-8.4-25.1-8.4-9.2 0-17.9 2.9-25.2 8.5L16.7 412.5C7.8 419.2 2.1 429 0.5 440.1c-2.1 14.8 3.8 29.5 16.2 39.3 4.3 3.3 9.2 5.7 14.5 7 13 3.2 25.8 0.6 36-7.1L505 148.6c3.1-2.3 7.4-2.3 10.4 0l441.8 332c7.3 5.5 16 8.4 25.1 8.4 13.7 0 26.3-6.5 34.2-17.7 13.3-18.8 7.9-44.9-10.4-58.6z" p-id="2979" fill="#8a8a8a"></path><path d="M906.7 499.4l-193.2-140-196.7-142.5c-3.4-2.5-8.1-2.5-11.5 0L308.7 359.4l-193.2 140c-5.6 4.1-9 10.6-9 17.6v392.1c0 35.5 29 64.5 64.5 64.5h246.7V716.2c0-30 24.6-54.6 54.6-54.6h77.5c30 0 54.6 24.6 54.6 54.6v257.4h246.7c35.5 0 64.5-29 64.5-64.5V517c0.1-6.9-3.3-13.5-8.9-17.6z" p-id="2980" fill="#8a8a8a"></path></svg>
						</a>
					</div>
					<div className="github">
						<a href="https://github.com/qianjiachun/uni-live" target="_blank" rel="noreferrer"><svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7184" width="24" height="24"><path d="M511.957333 21.333333C241.024 21.333333 21.333333 240.981333 21.333333 512c0 216.832 140.544 400.725333 335.573334 465.664 24.490667 4.394667 32.256-10.069333 32.256-23.082667 0-11.690667 0.256-44.245333 0-85.205333-136.448 29.610667-164.736-64.64-164.736-64.64-22.314667-56.704-54.4-71.765333-54.4-71.765333-44.586667-30.464 3.285333-29.824 3.285333-29.824 49.194667 3.413333 75.178667 50.517333 75.178667 50.517333 43.776 75.008 114.816 53.333333 142.762666 40.789333 4.522667-31.658667 17.152-53.376 31.189334-65.536-108.970667-12.458667-223.488-54.485333-223.488-242.602666 0-53.546667 19.114667-97.322667 50.517333-131.669334-5.034667-12.330667-21.930667-62.293333 4.778667-129.834666 0 0 41.258667-13.184 134.912 50.346666a469.802667 469.802667 0 0 1 122.88-16.554666c41.642667 0.213333 83.626667 5.632 122.88 16.554666 93.653333-63.488 134.784-50.346667 134.784-50.346666 26.752 67.541333 9.898667 117.504 4.864 129.834666 31.402667 34.346667 50.474667 78.122667 50.474666 131.669334 0 188.586667-114.730667 230.016-224.042666 242.090666 17.578667 15.232 33.578667 44.672 33.578666 90.453334v135.850666c0 13.141333 7.936 27.605333 32.853334 22.869334C862.250667 912.597333 1002.666667 728.746667 1002.666667 512 1002.666667 240.981333 783.018667 21.333333 511.957333 21.333333z" p-id="7185" fill="#8a8a8a"></path></svg></a>
					</div>
					<div onClick={onClickShare}>
						<svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2733" width="24" height="24"><path d="M380.36396 566.298587l300.553318 205.558677a149.295574 149.295574 0 1 1-38.731537 76.865893L338.262608 640.818406a149.295574 149.295574 0 1 1-13.180667-226.374746l318.938002-230.299087a149.295574 149.295574 0 1 1 43.082437 74.093261L375.501189 483.418215a149.039639 149.039639 0 0 1 4.905426 82.923028zM789.263209 213.406506a63.983817 63.983817 0 1 0 0-127.967635 63.983817 63.983817 0 0 0 0 127.967635z m0 725.149931a63.983817 63.983817 0 1 0 0-127.967635 63.983817 63.983817 0 0 0 0 127.967635z m-554.526418-341.247027a63.983817 63.983817 0 1 0 0-127.967634 63.983817 63.983817 0 0 0 0 127.967634z" fill="#8A8A8A" p-id="2734"></path></svg>
					</div>
				</div>
				<Tabs>
					<Tabs.TabPane title="视频">
						<Field label="显示">
							<Radio.Group value={showType} direction="horizontal" onChange={(v) => setShowType(v as IShowType)}>
								<Radio name="overlap">重叠</Radio>
								<Radio name="line">并列</Radio>
								<Radio name="grid">网格</Radio>
							</Radio.Group>
						</Field>
						<Field disabled={showType==="overlap"} type="digit" label="一行几个" value={String(lineCount)} onChange={(v) => setLineCount(Number(v))}></Field>
						<Field value={videoUrl} center clearable label="添加视频" placeholder="斗鱼/B站/虎牙直播间或任意平台直播流地址" button={
							<Button loading={isAddVideoLoading} size="small" type="primary" onClick={() => {addVideo(videoUrl, qnName)}}>添加</Button>
						} onChange={setVideoUrl}>
						</Field>
						<Field label="画质">
							<Radio.Group value={qnName} direction="horizontal" onChange={(v) => {setQnName(v as string)}}>
								<Radio name="原画">原画</Radio>
								<Radio name="蓝光">蓝光</Radio>
								<Radio name="超清">超清</Radio>
								<Radio name="高清">高清</Radio>
								<Radio name="流畅">流畅</Radio>
							</Radio.Group>
						</Field>
						<div>
							{videoOrderList.map((item, index) => {
								return (
									<Cell key={item.id} title={`${item.url} ${item.qnName}`}>
										<div className="flex justify-end h-full items-center">
											<GuideO className="ml-2 cursor-pointer text-xl" onClick={() => {
												copy(getVideoStreamById(item.id));
												Toast.success("成功复制直播流地址");
											}} />
											<ArrowUp style={{display: `${index === 0 ? "none" : "block"}`}} className="ml-2 cursor-pointer text-xl" onClick={() => {setVideoOrderList(list => arrayMoveUp(deepCopyArray(list), index))}} />
											<ArrowDown style={{display: `${index === videoOrderList.length - 1 ? "none" : "block"}`}} className="ml-2 cursor-pointer text-xl" onClick={() => {setVideoOrderList(list => arrayMoveDown(deepCopyArray(list), index))}} />
											<Cross className="ml-2 cursor-pointer text-xl" onClick={() => {
												Dialog.confirm({
													title: "提示",
													message: "确认删除视频？"
												}).then(() => {
													setVideoOrderList(list => {
														deletVideo(item.id);
														return list.filter(prelist => prelist.id !== item.id);
													})
												}).catch(() => {});
											}} />
										</div>
									</Cell>
								)
							})}
						</div>
					</Tabs.TabPane>
					<Tabs.TabPane title="弹幕">
						<Field label="不透明度">
							<Slider value={danmakuOpacity} min={0} max={100} onChange={(v: number) => {
								if (danmakuRef.current) {
									danmakuRef.current.opacity = v / 100;
								}
								setDanmakuOpacity(v);
							}}/>
						</Field>
						<Field value={danmakuUrl} center clearable label="直播间" placeholder="仅斗鱼,支持无限个直播间弹幕同时展示" button={
							<Button loading={isConnectDanmakuLoading} size="small" type="primary" onClick={() => {addDanmaku(danmakuUrl)}}>
								添加
							</Button>
						} onChange={setDanmakuUrl}></Field>
						<div>
							{danmakuList.map(item => {
								return (
									<Cell key={item.id} title={item.url}>
										<div className="flex justify-end h-full items-center">
											<Cross className="ml-2 cursor-pointer text-xl" onClick={() => {
												Dialog.confirm({
													title: "提示",
													message: "确认断开连接？"
												}).then(() => {
													closeWs(item.ws);
													setDanmakuList(list => {
														return list.filter(prelist => prelist.id !== item.id);
													})
												}).catch(() => {});
											}} />
										</div>
									</Cell>
								)
							})}
						</div>
					</Tabs.TabPane>
					<Tabs.TabPane title="IOS">
						<Button size="small" type="primary" className="w-full" onClick={() => {
							let videoList = document.querySelectorAll("video");
							videoList.forEach(item => {
								item.muted = true;
							})
							videoList.forEach(item => {
								item.play();
							})
						}}>全部静音播放</Button>
						<Button size="small" type="primary" className="w-full" onClick={() => {
							let videoList = document.querySelectorAll("video");
							videoList.forEach(item => {
								item.muted = false;
							})
						}}>全部打开声音</Button>
						<Collapse accordion>
							<Collapse.Item title="IPhone播放参考" name="iphone">
								<span className="font-bold text-red-300">非m3u8的直播流IPhone无法播放</span><br/>
								1. 浏览器使用<span className="font-bold">桌面模式</span>打开网页（不用桌面模式可能也行）<br/>
								2. 等视频加载出来，点击并列显示，点击<span className="font-bold">【全部静音播放】</span><br/>
								3. 此时视频都会全屏播放，使用双指缩小还原<br/>
								4. 调整好时间，点击<span className="font-bold">【全部打开声音】，恢复重叠显示即可</span><br/>
								<span className="font-bold text-red-300">不一定有用，有解决方案的请联系作者</span>
							</Collapse.Item>
							<Collapse.Item title="IPad播放参考" name="ipad">
								IPad是可以播放flv流的直播的，只是因为系统的原因，导致无法同时播放两个有声音的视频<br />
								可以尝试IPhone的方法，在播放时手动进行网页全屏，并不一定有效<br />
								<span className="font-bold text-red-300">征集解决方案，请联系作者</span>
							</Collapse.Item>
						</Collapse>
					</Tabs.TabPane>
					<Tabs.TabPane title="常见问题">
						<Collapse accordion>
							<Collapse.Item title="黑屏、只有齿轮" name="1">
								1. 可能是没有添加视频源，请切换到视频标签添加视频<br/>
								2. 正在加载，请等待十几秒（服务器请求量大），请不要频繁刷新<br/>
								3. 可能使用了代理、加速器导致网络问题，尝试修复网络（断网急救箱、DNS修复等）
							</Collapse.Item>
							<Collapse.Item title="视频没声音" name="2">
								1. 视频默认静音（浏览器限制），请自己打开声音
							</Collapse.Item>
							<Collapse.Item title="只有部分视频能播放" name="3">
								1. 如果是IPhone，只能播放m3u8流的直播，播放不了说明不是m3u8流。这个无解，建议换安卓或PC<br/>
								2. 可能视频卡了，尝试刷新一下网页等待一下，请不要频繁刷新
							</Collapse.Item>
						</Collapse>
					</Tabs.TabPane>
				</Tabs>
			</Popup>
			{/* 设置按钮 */}
			<Setting className="text-white fixed right-4 bottom-1/2 w-10 h-10 opacity-50 z-50" onClick={() => setIsShowSetting(true)} />
		</div>
	)
}

export default Index;
