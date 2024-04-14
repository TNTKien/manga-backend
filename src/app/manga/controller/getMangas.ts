import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { THonoContext } from "@/types/hono";
import { Manga } from "@prisma/client";

async function getMangas(c: THonoContext): TDataResponse<Manga[]> {
  try {
    const url = new URL(c.req.url);
    const pageParam = url.searchParams.get("page") || 1;

    const page = Number(pageParam);

    const mangas = await prisma.manga.findMany({
      skip: (page - 1) * 10,
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });
    return c.json(
      {
        message: "Manga fetched successfully",
        data: mangas,
      },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { getMangas };
