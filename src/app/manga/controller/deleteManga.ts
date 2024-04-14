import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { isMangaOwner } from "@/services/manga";
import { rmSync } from "fs";
import { THonoContext } from "@/types/hono";

async function deleteManga(c: THonoContext): TDataResponse {
  try {
    const mangaId = c.req.param("id");
    const userId = c.get("userId") as string;

    if (!(await isMangaOwner(userId, mangaId))) {
      return c.json(
        { message: "You are not the owner of this manga", data: null },
        403
      );
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

    return c.json({ message: "Manga deleted successfully", data: null }, 204);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { deleteManga };
