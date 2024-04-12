import prisma from "@/services/prisma";
import { TResponse } from "@/types/response";
import { Context, TypedResponse } from "hono";
import { isMangaOwner } from "@/services/manga";
import { rmSync } from "fs";

async function deleteManga(
  c: Context
): Promise<Response & TypedResponse<TResponse>> {
  try {
    const mangaId = c.req.param("id");
    const userId = c.get("userId") as string;

    if (!(await isMangaOwner(userId, mangaId))) {
      return c.json({ message: "You are not the owner of this manga" }, 403);
    }
    const manga = await prisma.manga.findFirstOrThrow({
      where: {
        id: mangaId,
      },
    });

    const chapters = await prisma.chapter.findMany({
      where: {
        mangaId: mangaId,
      },
    });

    await prisma.chapter.deleteMany({
      where: {
        mangaId: mangaId,
      },
    });

    await prisma.manga.delete({
      where: {
        id: mangaId,
      },
    });

    const rootDir = process.cwd();

    chapters.forEach(async (chapter) => {
      rmSync(`${rootDir}/static/images/chapter/${chapter.id}/`, {
        recursive: true,
        force: true,
      });
    });
    rmSync(rootDir + manga.cover, { force: true });

    return c.json({ message: "Manga deleted successfully" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { deleteManga };
