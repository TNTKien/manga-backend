import { Manga, Prisma } from "@prisma/client";
import prisma from "@/services/prisma";
import { TResponse } from "@/types/response";
import { Context, TypedResponse } from "hono";
import { isMangaOwner } from "@/services/manga";
import { rmSync } from "fs";

async function deleteChapter(
  c: Context
): Promise<Response & TypedResponse<TResponse>> {
  try {
    const chapterId = c.req.param("chapterId");
    const userId = c.get("userId") as string;
    const mangaId = c.req.param("managaId");

    if (!(await isMangaOwner(userId, mangaId))) {
      return c.json({ message: "You are not the owner of this manga" }, 403);
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

    return c.json({ message: "Chapter deleted successfully" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { deleteChapter };
