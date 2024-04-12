import { zfd } from "zod-form-data";
import { z } from "zod";
import { Context, TypedResponse } from "hono";
import prisma from "@/services/prisma";
import { Tags } from "@prisma/client";
import { TResponse } from "@/types/response";
import { uploadMangaCover } from "@/services/manga";

const schema = zfd.formData({
  cover: zfd.file(
    z
      .instanceof(File)
      .refine((file) => file.size < 2 * 1024 * 1024)
      .refine((file) => file.type.startsWith("image"))
  ),
  title: z.string().min(5).max(255),
  description: z.string().min(5).max(2048),
  author: zfd.repeatable(z.array(z.string().min(2).max(128))),
  tags: zfd.repeatable(z.array(z.nativeEnum(Tags))),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]),
});

type TMangaSuccess = TResponse & {
  mangaId: string;
};

async function mangaUpload(
  c: Context
): Promise<Response & TypedResponse<TMangaSuccess | TResponse>> {
  try {
    const { cover, title, description, author, tags, status } = schema.parse(
      await c.req.formData()
    );
    // console.log(data);
    const userId = c.get("userId") as string;
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
      { message: "Manga uploaded successfully", mangaId: newManga.id },
      201
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { mangaUpload };
