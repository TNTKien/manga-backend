import prisma from "@/services/prisma";
import { Prisma } from "@prisma/client";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";

async function userGrant(c: THonoContext): TDataResponse {
  try {
    const userId = c.get("userId");
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "ADMIN",
      },
    });
    if (!user) {
      return c.json({ message: "You can not do this", data: null }, 403);
    }

    const granteeId = c.req.param("id");
    const grantee = await prisma.user.findFirst({
      where: {
        id: granteeId,
        role: {
          in: ["ADMIN", "UPLOADER"],
        },
      },
    });
    if (grantee) {
      return c.json({ message: "User alreadly is Uploader", data: null }, 404);
    }

    await prisma.user.update({
      where: {
        id: granteeId,
      },
      data: {
        role: "UPLOADER",
      },
    });
    return c.json({ message: "User granted Uploader role", data: null }, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "An error occurred", data: null }, 400);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { userGrant };
