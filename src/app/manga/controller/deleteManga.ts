import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { isMangaOwner } from "@/services/manga";
import { rmSync } from "fs";
import { THonoContext } from "@/types/hono";
import { deleteChapterPages } from "@/services/chapter";

const rootDir = process.cwd();

async function deleteManga(c: THonoContext): TDataResponse {
  try {
    const mangaId = c.req.param("id");
    const userId = c.get("userId");

    if (!(await isMangaOwner(userId, mangaId))) {
      return c.json(
        { message: "You are not the owner of this manga", data: null },
        403
      );
    }
    const [manga, chapters] = await prisma.$transaction([
      prisma.manga.findFirstOrThrow({
        where: {
          id: mangaId,
        },
      }),
      prisma.chapter.findMany({
        where: {
          mangaId: mangaId,
        },
      }),
    ]);

    await prisma.$transaction([
      prisma.chapter.deleteMany({
        where: {
          mangaId: mangaId,
        },
      }),
      prisma.manga.delete({
        where: {
          id: mangaId,
        },
      }),
    ]);

    chapters.forEach(async (chapter) => deleteChapterPages(chapter.id));
    rmSync(rootDir + manga.cover, { force: true });

    return c.json({ message: "Manga deleted successfully", data: null }, 204);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { deleteManga };
