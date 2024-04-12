import { zfd } from "zod-form-data";
import { z } from "zod";
import { Context, TypedResponse } from "hono";
import prisma from "@/services/prisma";
import { Tags, Prisma } from "@prisma/client";
import { TResponse } from "@/types/response";
import { isMangaOwner, uploadMangaCover } from "@/services/manga";

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

async function mangaUpdate(
  c: Context
): Promise<TypedResponse<TResponse> & Response> {
  try {
    const { cover, title, description, author, tags, status } = schema.parse(
      await c.req.formData()
    );
    const userId = c.get("userId") as string;
    const mangaId = c.req.param("id");

    const isOwner = await isMangaOwner(userId, mangaId);
    if (!isOwner) {
      return c.json({ message: "You are not the owner of this manga" }, 403);
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
    return c.json({ message: "Manga updated successfully" }, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "An error occurred" }, 400);
    }
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { mangaUpdate };
