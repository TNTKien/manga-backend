import { rmSync, writeFileSync } from "fs";
import { zfd } from "zod-form-data";
import { z } from "zod";

const rootDir = process.cwd();
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function deleteChapterPages(chapterId: string) {
  rmSync(`${rootDir}/static/images/chapter/${chapterId}/`, {
    recursive: true,
    force: true,
  });
}

function chapterUploadSchema() {
  const schema = zfd.formData({
    title: z.string().min(5).max(255),
    pages: zfd.repeatable(
      z.array(
        zfd.file(
          z
            .instanceof(File)
            .refine((file) => file.size < MAX_IMAGE_SIZE)
            .refine((file) => file.type.startsWith("image"))
        )
      )
    ),
  });
  return schema;
}

function chapterUpdateSchema() {
  const schema = zfd.formData({
    title: z.string().min(5).max(255),
    pages: zfd.repeatable(
      z.array(
        zfd
          .file(
            z
              .instanceof(File)
              .refine((file) => file.size < MAX_IMAGE_SIZE)
              .refine((file) => file.type.startsWith("image"))
          )
          .or(z.string())
      )
    ),
  });

  return schema;
}

async function uploadChapterPage(img: File, chapterId: string, index: number) {
  const imgNameArr = img.name.split(".");
  const imgExt = imgNameArr[imgNameArr.length - 1];
  const imgPath = `${rootDir}/static/images/chapter/${chapterId}/${
    index + 1
  }.${imgExt}`;
  writeFileSync(imgPath, new Uint8Array(await img.arrayBuffer()));

  return imgPath.replace(rootDir, "");
}

export {
  deleteChapterPages,
  chapterUploadSchema,
  chapterUpdateSchema,
  uploadChapterPage,
};
