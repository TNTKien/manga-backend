import { Chapter } from "@prisma/client";
import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { THonoContext } from "@/types/hono";

async function getChapters(c: THonoContext): TDataResponse<Chapter[]> {
  try {
    const mangaId = c.req.param("id");

    const chapters = await prisma.chapter.findMany({
      where: {
        mangaId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return c.json(
      { message: "Chapters fetched successfully", data: chapters },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { getChapters };
