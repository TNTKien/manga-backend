import { z } from "zod";
import { zfd } from "zod-form-data";
import prisma from "@/services/prisma";
import { mkdirSync, writeFileSync } from "fs";
import { Prisma } from "@prisma/client";
import { TDataResponse } from "@/types/response";
import { isMangaOwner } from "@/services/manga";
import { THonoContext } from "@/types/hono";

const schema = zfd.formData({
  title: z.string().min(5).max(255),
  pages: zfd.repeatable(
    z.array(
      zfd.file(
        z
          .instanceof(File)
          .refine((file) => file.size < 2 * 1024 * 1024)
          .refine((file) => file.type.startsWith("image"))
      )
    )
  ),
});

async function uploadChapter(
  c: THonoContext
): TDataResponse<{ chapterId: string }> {
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

    const newChapter = await prisma.chapter.create({
      data: {
        title,
        mangaId,
      },
    });

    const chapterPages = await uploadChapterPages(newChapter.id, pages);

    await prisma.chapter.update({
      where: {
        id: newChapter.id,
      },
      data: {
        pages: chapterPages,
      },
    });
    return c.json(
      {
        message: "Chapter uploaded successfully",
        data: {
          chapterId: newChapter.id,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "Manga not found", data: null }, 404);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

async function uploadChapterPages(
  chapterId: string,
  pages: File[]
): Promise<string[]> {
  const rootDir = process.cwd();
  mkdirSync(`${rootDir}/static/images/chapter/${chapterId}`);
  let chapterPages = [];
  for (let i = 0; i < pages.length; i++) {
    const img = pages[i];
    const imgNameArr = img.name.split(".");
    const imgExt = imgNameArr[imgNameArr.length - 1];
    const imgPath = `${rootDir}/static/images/chapter/${chapterId}/${
      i + 1
    }.${imgExt}`;
    writeFileSync(imgPath, new Uint8Array(await img.arrayBuffer()));
    chapterPages.push(imgPath.replace(rootDir, ""));
  }
  return chapterPages;
}

export { uploadChapter };
