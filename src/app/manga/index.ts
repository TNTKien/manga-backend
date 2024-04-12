import { Hono } from "hono";
import {
  getMangas,
  getSpecificManga,
  mangaUpdate,
  deleteManga,
} from "./controller";

const app = new Hono();

app.get("/", getMangas);
app.get("/:id", getSpecificManga);
app.put("/:id", mangaUpdate);
app.delete("/:id", deleteManga);

export default app;
