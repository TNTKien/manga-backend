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

app = app.basePath("/api");

routes(app);

export default app;
