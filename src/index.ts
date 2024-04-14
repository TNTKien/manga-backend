import { Hono } from "hono";
import routes from "@/routes";
import { serveStatic } from "hono/bun";
import type { Variables } from "./types/hono";
import { appendTrailingSlash } from "hono/trailing-slash";

let app = new Hono<{ Variables: Variables }>();

app.use(appendTrailingSlash());

app.use(
  "/*",
  serveStatic({
    root: "./static/",
    rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  })
);

app = routes(app.basePath("/api"));

export default app;
