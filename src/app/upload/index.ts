import { Hono } from "hono";
import { mangaUpload, uploadChapter } from "./controller";
import checkAuth from "@/middlewares/checkAuth";
const app = new Hono();

app.post("/", checkAuth, mangaUpload);
app.post("/chapter", checkAuth, uploadChapter);

export default app;
