import { Hono } from "hono";
import upload from "./controller";
import checkAuth from "@/middlewares/checkAuth";
const app = new Hono();

app.post("/", checkAuth, upload);

export default app;
