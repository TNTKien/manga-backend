import { Hono } from "hono";
import { addMangaViews } from "./controller";

const app = new Hono();
app.post("/", addMangaViews);

export default app;
