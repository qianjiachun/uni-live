import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import styles from "./tailwind.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "DouyuEx联播",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export default function App() {
  return (
    <html lang="zh">
      <head>
        <Meta />
        <Links />
        <link crossOrigin="anonymous" integrity="sha384-YdIrmJChvAkVM+8hQGXMNtTzFW9dCTquf3ZKayhE6io9fXuzg5XDccHeJ36HwFIw" href="https://lib.baomitu.com/react-grid-layout/0.18.3/css/styles.min.css" rel="stylesheet"></link>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script crossOrigin="anonymous" integrity="sha512-Gnfb9M8vEmwrt8TWi2SbfxRnTV5eMAXiWs2YS5wBGGKoBp4V+8WxifSJeq5YEJln4UUO3va6NF+lYhvbvzmRfQ==" src="https://lib.baomitu.com/hls.js/0.15.0-alpha.2/hls.min.js"></script>
        <script crossOrigin="anonymous" integrity="sha384-yNUJV2bssrCTb2Yohsz4mHoZvB9xLNYuxpa5E9EwtxlOLyEoA3mTwBczkplrpQ0T" src="https://lib.baomitu.com/flv.js/0.0.2/flv.min.js"></script>
        <script src="https://unpkg.zhimg.com/react-player@2.10.1/dist/ReactPlayer.standalone.js"></script>
        <script crossOrigin="anonymous" integrity="sha512-t8vdA86yKUE154D1VlNn78JbDkjv3HxdK/0MJDMBUXUjshuzRgET0ERp/0MAgYS+8YD9YmFwnz6+FWLz1gRZaw==" src="https://lib.baomitu.com/crypto-js/4.1.1/core.min.js"></script>
        <script crossOrigin="anonymous" integrity="sha512-3sGbaDyhjGb+yxqvJKi/gl5zL4J7P5Yh4GXzq+E9puzlmVkIctjf4yP6LfijOUvtoBI3p9pLKia9crHsgYDTUQ==" src="https://lib.baomitu.com/crypto-js/4.1.1/md5.min.js"></script>
        <LiveReload />
      </body>
    </html>
  );
}
