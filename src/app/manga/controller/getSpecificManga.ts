import { Manga, Prisma } from "@prisma/client";
import prisma from "@/services/prisma";
import { TResponse } from "@/types/response";
import { Context, TypedResponse } from "hono";

type TMangaSuccess = TResponse & {
  data: Manga;
};

async function getSpecificManga(
  c: Context
): Promise<Response & TypedResponse<TMangaSuccess | TResponse>> {
  try {
    const mangaId = c.req.param("id");

    const manga = await prisma.manga.findUnique({
      where: {
        id: mangaId,
      },
    });
    return c.json({ message: "Manga fetched successfully", data: manga }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { getSpecificManga };
