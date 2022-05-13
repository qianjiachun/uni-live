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
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script crossOrigin="anonymous" integrity="sha512-49OFf+8jaHx4Vb7iFNb46Loq1pIxXlEYeVOQRIx0KLBRF4KSV6E7QK2Vw5r416TQDyBJW+DFh2CyTV7+gCWd6g==" src="https://lib.baomitu.com/flv.js/1.6.2/flv.min.js"></script>
        <script crossOrigin="anonymous" integrity="sha512-t8vdA86yKUE154D1VlNn78JbDkjv3HxdK/0MJDMBUXUjshuzRgET0ERp/0MAgYS+8YD9YmFwnz6+FWLz1gRZaw==" src="https://lib.baomitu.com/crypto-js/4.1.1/core.min.js"></script>
        <script crossOrigin="anonymous" integrity="sha512-3sGbaDyhjGb+yxqvJKi/gl5zL4J7P5Yh4GXzq+E9puzlmVkIctjf4yP6LfijOUvtoBI3p9pLKia9crHsgYDTUQ==" src="https://lib.baomitu.com/crypto-js/4.1.1/md5.min.js"></script>
        <LiveReload />
      </body>
    </html>
  );
}
