import prisma from "@/services/prisma";
import { Prisma } from "@prisma/client";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";
import { mangaFollowSchema } from "@/services/manga";

const schema = mangaFollowSchema();

async function userFollow(c: THonoContext): TDataResponse {
  try {
    const userId = c.get("userId");
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return c.json({ message: "User not found", data: null }, 404);
    }

    const { mangaId } = schema.parse(await c.req.formData());
    const manga = await prisma.manga.findFirst({
      where: {
        id: mangaId,
      },
    });
    if (!manga) {
      return c.json({ message: "Manga not found", data: null }, 404);
    }

    const isAlreadyFollowing = await isFollowing(mangaId, userId);
    if (isAlreadyFollowing) {
      return c.json({ message: "Already following", data: null }, 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          followingManga: {
            connect: {
              id: mangaId,
            },
          },
        },
      }),

      prisma.manga.update({
        where: {
          id: mangaId,
        },
        data: {
          totalFollowers: {
            increment: 1,
          },
        },
      }),
    ]);

    return c.json({ message: "Followed successfully", data: null }, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "An error occurred", data: null }, 400);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

async function userUnFollow(c: THonoContext): TDataResponse {
  try {
    const userId = c.get("userId");
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return c.json({ message: "User not found", data: null }, 404);
    }

    const { mangaId } = schema.parse(await c.req.formData());
    const manga = await prisma.manga.findFirst({
      where: {
        id: mangaId,
      },
    });
    if (!manga) {
      return c.json({ message: "Manga not found", data: null }, 404);
    }

    const isAlreadyFollowing = await isFollowing(mangaId, userId);
    if (!isAlreadyFollowing) {
      return c.json({ message: "Not following", data: null }, 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          followingManga: {
            disconnect: {
              id: mangaId,
            },
          },
        },
      }),

      prisma.manga.update({
        where: {
          id: mangaId,
        },
        data: {
          totalFollowers: {
            decrement: 1,
          },
        },
      }),
    ]);
    return c.json({ message: "Unfollowed successfully", data: null }, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "An error occurred", data: null }, 400);
    }
    console.log(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { userFollow, userUnFollow };

async function isFollowing(mangaId: string, userId: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      followingManga: {
        where: {
          id: mangaId,
        },
      },
    },
  });
  if (!user) {
    return false;
  }

  return user?.followingManga.length > 0;
}
