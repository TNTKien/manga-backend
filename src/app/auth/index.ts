import { Hono } from "hono";
import { register } from "./controller/register";
import { login } from "./controller/login";
import { refresh } from "./controller/refresh";
import { Logout, Session } from "./controller";

const app = new Hono();
app.get("/session", Session);
app.delete("/logout", Logout);
app.post("/register", register);
app.post("/login", login);
app.post("/refresh", refresh);

export default app;
