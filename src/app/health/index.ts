import { Hono } from "hono";
import { health } from "./controller";
import checkAuth from "@/middlewares/checkAuth";

const app = new Hono();

app.get("/", checkAuth, health);

export default app;
