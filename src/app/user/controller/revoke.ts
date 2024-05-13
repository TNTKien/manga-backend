import prisma from "@/services/prisma";
import { Prisma } from "@prisma/client";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";

async function userRevoke(c: THonoContext): TDataResponse {
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
          in: ["USER", "ADMIN"],
        },
      },
    });
    if (grantee) {
      return c.json({ message: "User is not Uploader", data: null }, 404);
    }

    await prisma.user.update({
      where: {
        id: granteeId,
      },
      data: {
        role: "USER",
      },
    });
    return c.json({ message: "User revoked Uploader role", data: null }, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "An error occurred", data: null }, 400);
    }
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { userRevoke };
