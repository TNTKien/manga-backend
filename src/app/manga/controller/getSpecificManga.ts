import { Manga } from "@prisma/client";
import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { THonoContext } from "@/types/hono";

async function getSpecificManga(c: THonoContext): TDataResponse<Manga> {
  try {
    const mangaId = c.req.param("id");

    const manga = await prisma.manga.findUniqueOrThrow({
      where: {
        id: mangaId,
      },
    });
    return c.json({ message: "Manga fetched successfully", data: manga }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { getSpecificManga };
