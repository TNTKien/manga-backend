import prisma from "@/services/prisma";
import { setCookie, getCookie } from "hono/cookie";
import { verifyToken, decodeToken, generateToken } from "@/utils/jwt";
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { Prisma, type User } from "@prisma/client";
import { TDataResponse } from "@/types/response";
import { THonoContext } from "@/types/hono";

async function refresh(c: THonoContext): TDataResponse<{ authToken: string }> {
  const refreshToken = getCookie(c, "refreshToken");
  const authToken = getCookie(c, "authToken");

  if (!refreshToken || !authToken) {
    return c.json({ message: "Invalid token", data: null }, 400);
  }

  try {
    const decoded = decodeToken(authToken) as User & JwtPayload;

    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: decoded.id,
      },
    });

    verifyToken(refreshToken);

    if (user.refreshToken.includes(refreshToken)) {
      const newToken = generateToken(user);
      setCookie(c, "authToken", newToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 30,
      });
      return c.json(
        { message: "Token refreshed", data: { authToken: newToken } },
        200
      );
    }
    return c.json({ message: "Invalid token", data: null }, 400);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return c.json({ message: "Invalid token", data: null }, 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "User not found", data: null }, 404);
    }
    console.log(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { refresh };
