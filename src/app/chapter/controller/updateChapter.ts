import prisma from "@/services/prisma";
import { Prisma } from "@prisma/client";
import { TDataResponse } from "@/types/response";
import { isMangaOwner } from "@/services/manga";
import { copyFileSync, renameSync, mkdirSync, rmSync } from "fs";
import { THonoContext } from "@/types/hono";
import { chapterUpdateSchema, uploadChapterPage } from "@/services/chapter";

const schema = chapterUpdateSchema();
const rootDir = process.cwd();

async function updateChapter(c: THonoContext): TDataResponse {
  try {
    const mangaId = c.req.param("mangaId");
    const userId = c.get("userId");
    const isOwner = await isMangaOwner(userId, mangaId);

    if (!isOwner) {
      return c.json(
        { message: "You are not the owner of this manga", data: null },
        403
      );
    }

    const { title, pages } = schema.parse(await c.req.formData());

    const chapterId = c.req.param("chapterId");

    const chapterDir = rootDir + `/static/images/chapter/${chapterId}/`;
    const oldDir = rootDir + `/static/images/chapter/${chapterId}_old/`;
    renameSync(chapterDir, oldDir);
    mkdirSync(chapterDir);

    const newChapterPages = await modifyChapterPages(
      pages,
      oldDir,
      chapterDir,
      chapterId
    );

    rmSync(oldDir, { recursive: true, force: true });

    await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        title: title,
        pages: newChapterPages,
      },
    });
    return c.json({ message: "Chapter updated successfully", data: null }, 200);
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "Chapter not found", data: null }, 404);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

async function modifyChapterPages(
  pages: (File | string)[],
  oldDir: string,
  chapterDir: string,
  chapterId: string
) {
  const promises = pages.map(async (page, index) => {
    let imagePath = "";
    if (typeof page === "string") {
      const imgExt = page.split(".").pop() || "jpg";
      const pagePath = page.replace(/(\/[0-9]+.[a-z]+)$/, "");
      copyFileSync(
        oldDir + page,
        chapterDir + `/${pagePath}/${index}.${imgExt}`
      );
      imagePath = `/${pagePath}/${index}.${imgExt}`;
    } else {
      imagePath = await uploadChapterPage(page, chapterId, index);
    }
    return imagePath;
  });

  const newChapterPages = await Promise.all(promises);

  return newChapterPages;
}

export { updateChapter };
