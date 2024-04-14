import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { uploadMangaCover, mangaUploadSchema } from "@/services/manga";
import { THonoContext } from "@/types/hono";

const schema = mangaUploadSchema();

async function uploadManga(
  c: THonoContext
): TDataResponse<{ mangaId: string }> {
  try {
    const { cover, title, description, author, tags, status } = schema.parse(
      await c.req.formData()
    );
    const userId = c.get("userId");
    const newManga = await prisma.manga.create({
      data: {
        cover: "",
        title: title,
        description: description,
        author: author,
        tags: tags,
        status: status,
        userId: userId,
      },
    });
    const imgPath = await uploadMangaCover(cover, newManga.id);
    await prisma.manga.update({
      where: {
        id: newManga.id,
      },
      data: {
        cover: imgPath,
      },
    });

    return c.json(
      {
        message: "Manga uploaded successfully",
        data: {
          mangaId: newManga.id,
        },
      },
      201
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { uploadManga };
