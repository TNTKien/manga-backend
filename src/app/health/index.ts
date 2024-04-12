import { Hono } from "hono";
import { health } from "./controller";
//import checkAuth from "@/middlewares/checkAuth";

const app = new Hono();

app.get("/", health);

export default app;
