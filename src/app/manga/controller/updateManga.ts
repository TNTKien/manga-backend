import prisma from "@/services/prisma";
import { Prisma } from "@prisma/client";
import {
  isMangaOwner,
  uploadMangaCover,
  mangaUpdateSchema,
} from "@/services/manga";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";
import { ZodError } from "zod";

const schema = mangaUpdateSchema();

async function mangaUpdate(c: THonoContext): TDataResponse {
  try {
    const userId = c.get("userId");
    const mangaId = c.req.param("id");

    const isOwner = await isMangaOwner(userId, mangaId);
    if (!isOwner) {
      return c.json(
        { message: "You are not the owner of this manga", data: null },
        403
      );
    }
    //console.log(await c.req.formData());
    const { cover, title, description, author, tags, status } = schema.parse(
      await c.req.formData()
    );
    //console.log(cover);

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
        cover: updatedCover + `?${new Date().getTime()}`,
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
    if (error instanceof ZodError) {
      //console.error(error);
      return c.json({ message: error.message, data: null }, 400);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { mangaUpdate };
