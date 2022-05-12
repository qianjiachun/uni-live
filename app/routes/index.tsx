import { Setting } from "@react-vant/icons";
import type { LinksFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button, Field, Popup, Radio, Switch, Tabs } from "react-vant";
import stylesVant from "react-vant/lib/index.css";
import { eval1, getLastField } from "~/utils";


export const links: LinksFunction = () => {
	return [
		{rel: "stylesheet", href: stylesVant},
	]
}

const Index = () => {
	const [isShowSetting, setIsShowSetting] = useState<boolean>(false);
	// overlap重叠 line并列
	const [showType, setShowType] = useState<string>("line");
	// 视频地址数组
	const [videoList, setVideoList] = useState<IVideo[]>([]);

	const [videoUrl, setVideoUrl] = useState<string>("");
	const [isAddVideoLoading, setIsAddVideoLoading] = useState<boolean>(false);

	const fetcher = useFetcher();
	useEffect(() => {
		const data = fetcher.data;
		if (!data) return;
		if ("type" in data && data.type === "douyuScript") {
			eval1(data.script, "exScript1");
			let tt = Math.round(new Date().getTime()/1000).toString();
			let param = window.ub98484234(data.rid, "10000000000000000000000000001501", tt);
			let scriptDom = document.getElementById("exScript1");
			if (scriptDom) {
				scriptDom.remove();
			}
			fetcher.submit({rid: data.rid, param, tt, qn: data.qn}, {action: "/api/real_douyu", method: "post"});
		} else {
			setVideoList((list) => [...list, {
				src: data.src,
				stream: data.stream
			}]);
			console.log(videoList);
		}
		setIsAddVideoLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data])

	const addVideo = (url: string) => {
		// 拿到视频地址，对视频地址解析，获得视频直播流地址
		// 添加到VideoList中去
		setIsAddVideoLoading(true);
		let rid = getLastField(url);
		if (url.includes("douyu.com")) {
			fetcher.submit({rid, qn: "1"}, {action: "/api/real_douyu_script", method: "post"});
		} else if (url.includes("bilibili.com")) {
			fetcher.submit({rid, qn: "4"}, {action: "/api/real_bilibili", method: "post"});
		} else if (url.includes("huya.com")) {
			fetcher.submit({rid}, {action: "/api/real_huya", method: "post"});
		}
	}

	
	return (
		<div className="w-full h-full">
			{/* 视频区 */}
			<div className="flex w-full h-full flex-wrap">
			</div>
			{/* 设置 */}
			<Popup className="popup" visible={isShowSetting} position="bottom" style={{height: "50%"}} onClose={() => setIsShowSetting(false)}>
				<Tabs>
					<Tabs.TabPane title="视频">
						<Field label="显示">
							<Radio.Group value={showType} defaultValue="line" direction="horizontal" onChange={(v) => setShowType(v as string)}>
								<Radio name="line">并列</Radio>
								<Radio name="overlap">重叠</Radio>
							</Radio.Group>
						</Field>
						<Field value={videoUrl} center clearable label="添加视频" placeholder="斗鱼/Bilibili/虎牙直播间地址" button={
							<Button loading={isAddVideoLoading} size="small" type="primary" onClick={() => {addVideo(videoUrl)}}>添加</Button>
						} onChange={setVideoUrl}>
						</Field>
					</Tabs.TabPane>
					<Tabs.TabPane title="弹幕">

					</Tabs.TabPane>
				</Tabs>
			</Popup>
			{/* 设置按钮 */}
			<Setting className="fixed right-8 bottom-8 w-10 h-10 opacity-40" onClick={() => setIsShowSetting(true)} />
		</div>
	)
}

export default Index;
