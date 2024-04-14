import { Hono } from "hono";
import { searchMangas, searchUsers } from "./controller";

const app = new Hono();

app.get("/manga", searchMangas);
app.get("/user", searchUsers);

export default app;
