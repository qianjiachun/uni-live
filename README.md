## DouyuEx联播

### 网站
[http://live.douyuex.com](http://live.douyuex.com)

### 功能
1. 支持无限个平台直播画面/声音同时播放
2. 支持斗鱼/虎牙/B站无限个直播间弹幕同时飘屏
3. 支持斗鱼/虎牙/B站直播流解析，其他任意平台需直接输入直播流
4. **自由布局**：每个视频可拖动位置、调整大小，布局自动保存
5. **单视频刷新**：每个视频卡片可重新获取直播流
6. 三种布局模式：重叠模式、均分模式、自由布局
7. 支持分享链接，保存视频列表、弹幕和布局配置
8. 设置支持本地保存

### 技术栈
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- react-player（npm 包，替代 CDN 脚本）

### 开发

```bash
npm install
npm run dev
```

### 构建

```bash
npm run build
npm start   # http://localhost:7002
```

### Docker 部署（推荐，不依赖宿主机 Node 版本）

镜像内置 **Node 20**，适合宝塔等全局 Node 16 的环境。

```bash
# 构建并启动（端口 7002）
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

仅使用 Docker（不用 compose）：

```bash
docker build -t douyuex-live .
docker run -d --name douyuex-live -p 7002:7002 --restart unless-stopped douyuex-live
```

宝塔面板：安装 **Docker 管理器** → 可导入 `docker-compose.yml`，或 SSH 进入项目目录执行 `docker compose up -d --build`。网站反代到 `http://127.0.0.1:7002` 即可。

更新部署：

```bash
git pull
docker compose up -d --build
```

### 注意
1. 视频默认静音（浏览器限制），请手动打开声音
2. iPhone 仅支持 HLS 流；虎牙在 iOS 上可能无法播放
3. 移动端自由布局自动降级为均分模式

### 声明
请勿用于商业用途，网站仅为方便大众观看。
