import { Hono } from "hono";
import {
  getMangas,
  getSpecificManga,
  mangaUpdate,
  deleteManga,
  uploadManga,
} from "./controller";
import checkAuth from "@/middlewares/checkAuth";

const app = new Hono();

app.get("/", getMangas);
app.post("/", checkAuth, uploadManga);
app.get("/:id", getSpecificManga);
app.put("/:id", checkAuth, mangaUpdate);
app.delete("/:id", checkAuth, deleteManga);

export default app;
