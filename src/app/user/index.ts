import { Hono } from "hono";
import { userGrant, userRevoke } from "./controller";
import checkAuth from "@/middlewares/checkAuth";

const app = new Hono();
app.put("/grant/:id", checkAuth, userGrant);
app.put("/revoke/:id", checkAuth, userRevoke);

export default app;
