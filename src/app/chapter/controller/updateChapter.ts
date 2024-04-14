import { zfd } from "zod-form-data";
import { z } from "zod";
import prisma from "@/services/prisma";
import { Prisma } from "@prisma/client";
import { TDataResponse } from "@/types/response";
import { isMangaOwner } from "@/services/manga";
import { writeFileSync, copyFileSync, renameSync, mkdirSync, rmSync } from "fs";
import { THonoContext } from "@/types/hono";

const schema = zfd.formData({
  title: z.string().min(5).max(255),
  pages: zfd.repeatable(
    z.array(
      zfd
        .file(
          z
            .instanceof(File)
            .refine((file) => file.size < 2 * 1024 * 1024)
            .refine((file) => file.type.startsWith("image"))
        )
        .or(z.string())
    )
  ),
  mangaId: z.string(),
});

async function updateChapter(c: THonoContext): TDataResponse {
  try {
    const { title, pages, mangaId } = schema.parse(await c.req.formData());

    const userId = c.get("userId") as string;
    const isOwner = await isMangaOwner(userId, mangaId);

    if (!isOwner) {
      return c.json(
        { message: "You are not the owner of this manga", data: null },
        403
      );
    }

    const chapterId = c.req.param("chapterId");

    const rootDir = process.cwd();
    const chapterDir = rootDir + `/static/images/chapter/${chapterId}/`;
    const oldDir = rootDir + `/static/images/chapter/${chapterId}_old/`;
    renameSync(chapterDir, oldDir);
    mkdirSync(chapterDir);

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
        const imgNameArr = page.name.split(".");
        const imgExt = imgNameArr[imgNameArr.length - 1];
        writeFileSync(
          chapterDir + `${index}.${imgExt}`,
          new Uint8Array(await page.arrayBuffer())
        );
        imagePath = `/${chapterId}/${index}.${imgExt}`;
      }
      return imagePath;
    });

    const newChapterPages = await Promise.all(promises);

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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "Chapter not found", data: null }, 404);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}
export { updateChapter };
