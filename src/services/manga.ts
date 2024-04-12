import prisma from "./prisma";
import { writeFileSync } from "fs";

async function isMangaOwner(userId: string, mangaId: string): Promise<boolean> {
  try {
    await prisma.manga.findFirstOrThrow({
      where: {
        id: mangaId,
        userId: userId,
      },
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function uploadMangaCover(cover: File, mangaId: string): Promise<string> {
  const imgNameArr = cover.name.split(".");
  const imgExt = imgNameArr[imgNameArr.length - 1];

  const rootDir = process.cwd();
  const imgPath = `${rootDir}/static/images/manga/${mangaId}.${imgExt}`;
  writeFileSync(imgPath, new Uint8Array(await cover.arrayBuffer()));
  return imgPath.replace(rootDir, "");
}

export { isMangaOwner, uploadMangaCover };
