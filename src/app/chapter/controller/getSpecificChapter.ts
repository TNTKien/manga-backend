import { Chapter, Prisma } from "@prisma/client";
import prisma from "@/services/prisma";
import { TResponse } from "@/types/response";
import { Context, TypedResponse } from "hono";

type TChapterSuccess = TResponse & {
  data: Chapter;
};

async function getSpecificChapter(
  c: Context
): Promise<Response & TypedResponse<TChapterSuccess | TResponse>> {
  try {
    const chapterId = c.req.param("chapterId");

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });
    return c.json(
      { message: "Manga fetched successfully", data: chapter },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { getSpecificChapter };
