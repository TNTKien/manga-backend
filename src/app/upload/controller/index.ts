import { zfd } from "zod-form-data";
import { EMPTY_PATH, z } from "zod";
import { Context, TypedResponse } from "hono";
import { writeFileSync } from "fs";
import prisma from "@/services/prisma";
import { Tags } from "@prisma/client";

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

type TMangaUpload = {
  message: string;
};

async function mangaUpload(
  c: Context
): Promise<Response & TypedResponse<TMangaUpload>> {
  try {
    const { cover, title, description, author, tags, status } = schema.parse(
      await c.req.formData()
    );
    // console.log(data);

    const newManga = await prisma.manga.create({
      data: {
        cover: "",
        title: title,
        description: description,
        author: author,
        tags: [...tags] as Tags[],
        status: status,
      },
    });

    const imgNameArr = cover.name.split(".");
    //const imgName = imgNameArr[0];
    const imgExt = imgNameArr[imgNameArr.length - 1];

    const rootDir = process.cwd();
    const imgPath = `${rootDir}/static/images/${newManga.id}.${imgExt}`;
    writeFileSync(imgPath, new Uint8Array(await cover.arrayBuffer()));

    await prisma.manga.update({
      where: {
        id: newManga.id,
      },
      data: {
        cover: imgPath.replace(rootDir, ""),
      },
    });

    return c.json({ message: "Manga uploaded successfully" }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export default mangaUpload;
