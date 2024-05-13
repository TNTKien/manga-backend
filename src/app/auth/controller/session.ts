import { THonoContext } from "@/types/hono";
import { setCookie, getCookie } from "hono/cookie";
import { verifyToken, decodeToken, generateToken } from "@/utils/jwt";
import { Prisma, type User } from "@prisma/client";
import prisma from "@/services/prisma";
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

async function Session(c: THonoContext) {
  const authToken = getCookie(c, "authToken");
  //console.log(authToken);

  if (!authToken) {
    return c.json({ message: "Invalid token", data: null }, 400);
  }

  try {
    const decoded = decodeToken(authToken) as User & JwtPayload;

    const user = await prisma.user.findFirstOrThrow({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
      where: {
        id: decoded.id,
      },
    });
    return c.json({ message: "Session fetched", data: user }, 200);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return c.json({ message: "Invalid token 3", data: null }, 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "User not found", data: null }, 404);
    }
    //console.log(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { Session };
