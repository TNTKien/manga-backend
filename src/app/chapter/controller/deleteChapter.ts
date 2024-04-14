import prisma from "@/services/prisma";
import { isMangaOwner } from "@/services/manga";
import { rmSync } from "fs";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";

async function deleteChapter(c: THonoContext): TDataResponse {
  try {
    const chapterId = c.req.param("chapterId");
    const userId = c.get("userId") as string;
    const mangaId = c.req.param("managaId");

    if (!(await isMangaOwner(userId, mangaId))) {
      return c.json(
        { message: "You are not the owner of this manga", data: null },
        403
      );
    }

    const chapter = await prisma.chapter.findFirstOrThrow({
      where: {
        id: chapterId,
      },
    });

    await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });
    const rootDir = process.cwd();

    rmSync(`${rootDir}/static/images/chapter/${chapterId}/`, {
      recursive: true,
      force: true,
    });

    return c.json({ message: "Chapter deleted successfully", data: null }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { deleteChapter };
