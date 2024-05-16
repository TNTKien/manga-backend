import { Hono } from "hono";
import { userGrant, userRevoke, userFollow, userUnFollow } from "./controller";
import checkAuth from "@/middlewares/checkAuth";

const app = new Hono();
app.post("/follow", checkAuth, userFollow);
app.post("/unfollow", checkAuth, userUnFollow);
app.put("/grant/:id", checkAuth, userGrant);
app.put("/revoke/:id", checkAuth, userRevoke);

export default app;
