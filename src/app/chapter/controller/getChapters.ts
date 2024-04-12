import { Chapter, Prisma } from "@prisma/client";
import prisma from "@/services/prisma";
import { TResponse } from "@/types/response";
import { Context, TypedResponse } from "hono";

type TChapterSuccess = TResponse & {
  data: Chapter[];
};

async function getChapters(
  c: Context
): Promise<Response & TypedResponse<TChapterSuccess | TResponse>> {
  try {
    const mangaId = c.req.param("id");

    const chapters = await prisma.chapter.findMany({
      where: {
        mangaId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return c.json(
      { message: "Chapters fetched successfully", data: chapters },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { getChapters };
