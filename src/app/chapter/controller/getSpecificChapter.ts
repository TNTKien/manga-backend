import { Chapter } from "@prisma/client";
import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { THonoContext } from "@/types/hono";

async function getSpecificChapter(c: THonoContext): TDataResponse<Chapter> {
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
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { getSpecificChapter };
