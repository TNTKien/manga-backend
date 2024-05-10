import { Hono } from "hono";
import routes from "@/routes";
import { serveStatic } from "hono/bun";
import type { Variables } from "./types/hono";
import { appendTrailingSlash } from "hono/trailing-slash";
import { cors } from "hono/cors";

let app = new Hono<{ Variables: Variables }>();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowHeaders: [
      "X-Custom-Header",
      "Upgrade-Insecure-Requests",
      "Content-Type",
    ],
    allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

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
