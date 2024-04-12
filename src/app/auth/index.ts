import { Hono } from "hono";
import { register } from "./controller/register";
import { login } from "./controller/login";
import { refresh } from "./controller/refresh";

const app = new Hono();
app.post("/register", register);
app.post("/login", login);
app.post("/refresh", refresh);

export default app;
