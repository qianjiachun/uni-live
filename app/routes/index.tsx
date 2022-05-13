import { ArrowDown, ArrowUp, Cross, Setting } from "@react-vant/icons";
import type { LinksFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button, Field, Popup, Radio, Switch, Tabs, Toast, Cell, Dialog } from "react-vant";
import stylesVant from "react-vant/lib/index.css";
import VideoItem from "~/components/VideoItem";
import { arrayMoveDown, arrayMoveUp, deepCopyArray, eval1, getLastField, isRid, parseUrlParams } from "~/utils";


export const links: LinksFunction = () => {
	return [
		{rel: "stylesheet", href: stylesVant},
	]
}

const Index = () => {
	const [isShowSetting, setIsShowSetting] = useState<boolean>(false);
	// overlap重叠 line并列
	const [showType, setShowType] = useState<string>("overlap");
	// 视频地址数组
	const [videoList, setVideoList] = useState<IVideo[]>([]);
	const [videoOrderList, setVideoOrderList] = useState<IVideoOrder[]>([]);
	const [qnName, setQnName] = useState<string>("原画");

	// 每行个数
	const [lineCount, setLineCount] = useState<number>(2);

	const [videoUrl, setVideoUrl] = useState<string>("");
	const [isAddVideoLoading, setIsAddVideoLoading] = useState<boolean>(false);

	useEffect(() => {
		let local_videoList = localStorage.getItem("videoList");
		if (local_videoList) {
			setVideoList(JSON.parse(local_videoList));
		}
		let local_videoOrderList = localStorage.getItem("videoOrderList");
		if (local_videoOrderList) {
			setVideoOrderList(JSON.parse(local_videoOrderList));
		}
	}, [])
	const fetcher = useFetcher();
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
			setVideoOrderList(list => [...list, {id, url: data.url}]);
		}
		setIsAddVideoLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data])

	useEffect(() => {
		localStorage.setItem("videoList", JSON.stringify(videoList));
	}, [videoList])
	useEffect(() => {
		localStorage.setItem("videoOrderList", JSON.stringify(videoOrderList));
	}, [videoOrderList])


	const addVideo = (url: string) => {
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
			fetcher.submit({url, rid}, {action: "/api/real_huya", method: "post"});
		} else {
			let id = String(new Date().getTime());
			setVideoList((list) => [...list, {
				id,
				order: list.length - 1,
				url: url,
				rid: url,
				stream: url
			}]);
			setVideoOrderList(list => [...list, {id, url}]);
			setIsAddVideoLoading(false);
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

	
	return (
		<div className="w-full h-full">
			{/* 视频区 */}
			<div className="videolist flex w-full h-full flex-wrap bg-black">
				{videoList.map((item, index) => {
					return (
						<VideoItem style={{
							flex: `${lineCount ? "0 0 " + String(100/lineCount) + "%" : ""}`,
							position: `${showType === "overlap" ? "absolute" : "inherit"}`,
							height: `${showType === "overlap" ? "100%" : "auto"}`,
							width: `${showType === "overlap" ? "100%" : "auto"}`
						}} key={item.id} url={item.url} order={item.order} src={item.stream}></VideoItem>
					)
				})}
			</div>
			{/* 设置 */}
			<Popup className="popup overflow-hidden" visible={isShowSetting} position="bottom" style={{height: "50%"}} onClose={() => setIsShowSetting(false)}>
				<Tabs>
					<Tabs.TabPane title="视频">
						<Field label="画质">
							<Radio.Group value={qnName} direction="horizontal" onChange={(v) => {setQnName(v as string)}}>
								<Radio name="原画">原画</Radio>
								<Radio name="蓝光">蓝光</Radio>
								<Radio name="超清">超清</Radio>
								<Radio name="高清">高清</Radio>
								<Radio name="流畅">流畅</Radio>
							</Radio.Group>
						</Field>
						<Field value={videoUrl} center clearable label="添加视频" placeholder="斗鱼/B站/虎牙直播间或直播流地址" button={
							<Button loading={isAddVideoLoading} size="small" type="primary" onClick={() => {addVideo(videoUrl)}}>添加</Button>
						} onChange={setVideoUrl}>
						</Field>
						<div>
							{videoOrderList.map((item, index) => {
								return (
									<Cell key={item.id} title={item.url}>
										<div className="flex justify-end h-full items-center">
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
					</Tabs.TabPane>
					<Tabs.TabPane title="设置">
						<Field label="显示">
							<Radio.Group value={showType} direction="horizontal" onChange={(v) => setShowType(v as string)}>
								<Radio name="overlap">重叠</Radio>
								<Radio name="line">并列</Radio>
							</Radio.Group>
						</Field>
						<Field disabled={showType==="overlap"} type="digit" label="一行几个" value={String(lineCount)} onChange={(v) => setLineCount(Number(v))}></Field>
					</Tabs.TabPane>
				</Tabs>
			</Popup>
			{/* 设置按钮 */}
			<Setting className="text-white fixed right-8 top-8 w-10 h-10 opacity-40 z-50" onClick={() => setIsShowSetting(true)} />
		</div>
	)
}

export default Index;
