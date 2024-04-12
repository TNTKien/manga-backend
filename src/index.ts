import { Hono } from "hono";
import routes from "@/routes";
import { serveStatic } from "hono/bun";

let app = new Hono();

app.use(
  "/*",
  serveStatic({
    root: "./static/",
    rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  })
);

app = routes(app.basePath("/api"));

export default app;
