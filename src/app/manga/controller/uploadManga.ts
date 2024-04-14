import { zfd } from "zod-form-data";
import { z } from "zod";
import prisma from "@/services/prisma";
import { Tags } from "@prisma/client";
import { TDataResponse } from "@/types/response";
import { uploadMangaCover } from "@/services/manga";
import { THonoContext } from "@/types/hono";

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

async function uploadManga(
  c: THonoContext
): TDataResponse<{ mangaId: string }> {
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
