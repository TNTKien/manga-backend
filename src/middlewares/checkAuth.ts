import { verifyToken } from "@/utils/jwt";
import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { JsonWebTokenError } from "jsonwebtoken";
import { Prisma, type User } from "@prisma/client";
import prisma from "@/services/prisma";

async function checkAuth(c: Context, next: Next) {
  const authToken = getCookie(c, "authToken");

  if (!authToken) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const user = verifyToken(authToken) as User;
    await prisma.user.findFirstOrThrow({
      where: {
        id: user.id,
      },
    });

    c.set("userId", user.id);

    await next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return c.json({ message: "Invalid token" }, 401);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "User not found" }, 404);
    }
    return c.json({ message: "An error occurred" }, 500);
  }
}

export default checkAuth;
