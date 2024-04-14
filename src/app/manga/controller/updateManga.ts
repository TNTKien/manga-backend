import { zfd } from "zod-form-data";
import { z } from "zod";
import prisma from "@/services/prisma";
import { Tags, Prisma } from "@prisma/client";
import { isMangaOwner, uploadMangaCover } from "@/services/manga";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";

const schema = zfd.formData({
  cover: zfd
    .file(
      z
        .instanceof(File)
        .refine((file) => file.size < 2 * 1024 * 1024)
        .refine((file) => file.type.startsWith("image"))
    )
    .or(z.string()),
  title: z.string().min(5).max(255),
  description: z.string().min(5).max(2048),
  author: zfd.repeatable(z.array(z.string().min(2).max(128))),
  tags: zfd.repeatable(z.array(z.nativeEnum(Tags))),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]),
});

async function mangaUpdate(c: THonoContext): TDataResponse {
  try {
    const { cover, title, description, author, tags, status } = schema.parse(
      await c.req.formData()
    );
    const userId = c.get("userId") as string;
    const mangaId = c.req.param("id");

    const isOwner = await isMangaOwner(userId, mangaId);
    if (!isOwner) {
      return c.json(
        { message: "You are not the owner of this manga", data: null },
        403
      );
    }

    let updatedCover: string;
    if (cover instanceof File) {
      updatedCover = await uploadMangaCover(cover, mangaId);
    } else {
      updatedCover = cover;
    }
    await prisma.manga.update({
      where: {
        id: mangaId,
      },
      data: {
        cover: updatedCover,
        title: title,
        description: description,
        tags: tags,
        status: status,
        author: author,
      },
    });
    return c.json({ message: "Manga updated successfully", data: null }, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "An error occurred", data: null }, 400);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { mangaUpdate };
