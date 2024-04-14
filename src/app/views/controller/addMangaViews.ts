import { THonoContext } from "@/types/hono";
import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";

type TAddMangaViewsBody = {
  mangaId: string;
};

async function addMangaViews(c: THonoContext): TDataResponse {
  try {
    const { mangaId } = (await c.req.json()) as TAddMangaViewsBody;
    await prisma.manga.update({
      where: {
        id: mangaId,
      },
      data: {
        totalViews: {
          increment: 1,
        },
      },
    });

    return c.json({ message: "View added successfully", data: null }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { addMangaViews };
