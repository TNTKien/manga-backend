import { Hono } from "hono";
import {
  getChapters,
  getSpecificChapter,
  updateChapter,
  deleteChapter,
  uploadChapter,
} from "./controller";
import checkAuth from "@/middlewares/checkAuth";

const app = new Hono();

app.get("/:id", getChapters);

// upload CHAPTER
app.post("/:mangaId", checkAuth, uploadChapter);

// get specific chapter
app.get("/:mangaId/:chapterId", getSpecificChapter);

// update and delete chapter
app.put("/:mangaId/:chapterId", checkAuth, updateChapter);
app.delete("/:mangaId/:chapterId", checkAuth, deleteChapter);

export default app;
