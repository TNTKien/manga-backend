import { Hono } from "hono";

import { getTags } from "./controller/getTags";

const app = new Hono();

app.get("/", getTags);

export default app;
