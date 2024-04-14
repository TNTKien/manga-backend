import prisma from "@/services/prisma";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";
import { Manga } from "@prisma/client";

async function searchMangas(c: THonoContext): TDataResponse<Manga[]> {
  const url = new URL(c.req.url);

  const query = url.searchParams.get("query");
  if (!query) {
    return c.json({ message: "Query is required", data: null }, 400);
  }
  try {
    const mangas = await prisma.manga.findMany({
      where: {
        title: {
          contains: query,
        },
      },
    });

    return c.json(
      { message: "Mangas fetched successfully", data: mangas },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { searchMangas };
