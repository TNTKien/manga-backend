import { Manga, Prisma } from "@prisma/client";
import prisma from "@/services/prisma";
import { TResponse } from "@/types/response";
import { Context, TypedResponse } from "hono";

type TMangaSuccess = TResponse & {
  data: Manga[];
};
async function getMangas(
  c: Context
): Promise<Response & TypedResponse<TMangaSuccess | TResponse>> {
  try {
    const url = new URL(c.req.url);
    const pageParam = url.searchParams.get("page") || 1;

    const page = Number(pageParam);

    const manga = await prisma.manga.findMany({
      skip: (page - 1) * 10,
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });
    return c.json({ message: "Manga fetched successfully", data: manga }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { getMangas };
