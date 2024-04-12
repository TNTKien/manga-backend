import { Hono } from "hono";
import {
  getChapters,
  getSpecificChapter,
  updateChapter,
  deleteChapter,
} from "./controller";

const app = new Hono();

app.get("/:id", getChapters);
app.get("/:mangaId/:chapterId", getSpecificChapter);
app.put("/:mangaId/:chapterId", updateChapter);
app.delete("/:mangaId/:chapterId", deleteChapter);

export default app;
