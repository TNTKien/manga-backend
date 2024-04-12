import type { Context, TypedResponse } from "hono";
import prisma from "@/services/prisma";
import { setCookie, getCookie } from "hono/cookie";
import { verifyToken, decodeToken, generateToken } from "@/utils/jwt";
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { Prisma, type User } from "@prisma/client";

type TRefreshResponse = {
  message: string;
};

async function refresh(
  c: Context
): Promise<Response & TypedResponse<TRefreshResponse>> {
  const refreshToken = getCookie(c, "refreshToken");
  const authToken = getCookie(c, "authToken");

  if (!refreshToken || !authToken) {
    return c.json({ message: "Invalid token" }, 400);
  }

  try {
    const decoded = decodeToken(authToken) as User & JwtPayload;
    //console.log(decoded);

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
      return c.json({ message: "Token refreshed", authToken: newToken }, 200);
    }
    return c.json({ message: "Invalid token" }, 400);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return c.json({ message: "Invalid token" }, 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "User not found" }, 404);
    }
    console.log(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

export { refresh };
