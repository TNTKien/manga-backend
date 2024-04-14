import prisma from "./prisma";
import { writeFileSync } from "fs";
import { zfd, formData } from "zod-form-data";
import { z } from "zod";
import { Tags } from "@prisma/client";

async function isMangaOwner(userId: string, mangaId: string): Promise<boolean> {
  try {
    await prisma.manga.findFirstOrThrow({
      where: {
        id: mangaId,
        userId: userId,
      },
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function uploadMangaCover(cover: File, mangaId: string): Promise<string> {
  const imgNameArr = cover.name.split(".");
  const imgExt = imgNameArr[imgNameArr.length - 1];

  const rootDir = process.cwd();
  const imgPath = `${rootDir}/static/images/manga/${mangaId}.${imgExt}`;
  writeFileSync(imgPath, new Uint8Array(await cover.arrayBuffer()));
  return imgPath.replace(rootDir, "");
}

function mangaUploadSchema() {
  const schema = zfd.formData({
    cover: zfd.file(
      z
        .instanceof(File)
        .refine((file) => file.size < 2 * 1024 * 1024, {
          message: "File size must be less than 2MB",
        })
        .refine((file) => file.type.startsWith("image"))
    ),
    title: z.string().min(5).max(255),
    description: z.string().min(5).max(2048),
    author: zfd.repeatable(z.array(z.string().min(2).max(128))),
    tags: zfd.repeatable(z.array(z.nativeEnum(Tags))),
    status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]),
  });

  return schema;
}

function mangaUpdateSchema() {
  const schema = zfd.formData({
    cover: zfd
      .file(
        z
          .instanceof(File)
          .refine((file) => file.size < 2 * 1024 * 1024, {
            message: "File size must be less than 2MB",
          })
          .refine((file) => file.type.startsWith("image"))
      )
      .or(z.string()),
    title: z.string().min(5).max(255),
    description: z.string().min(5).max(2048),
    author: zfd.repeatable(z.array(z.string().min(2).max(128))),
    tags: zfd.repeatable(z.array(z.nativeEnum(Tags))),
    status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]),
  });
  return schema;
}

export { isMangaOwner, uploadMangaCover, mangaUpdateSchema, mangaUploadSchema };
