import prisma from "@/services/prisma";
import { setCookie, getCookie } from "hono/cookie";
import { verifyToken, decodeToken, generateToken } from "@/utils/jwt";
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { Prisma, type User } from "@prisma/client";
import { TDataResponse } from "@/types/response";
import { THonoContext } from "@/types/hono";

async function Logout(c: THonoContext): TDataResponse {
  const refreshToken = getCookie(c, "refreshToken");
  
  if (!refreshToken) {
    return c.json({ message: "Invalid token", data: null }, 400);
  }
  try {
    const decoded = verifyToken(refreshToken) as User & JwtPayload;
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: decoded.id,
      },
    });
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: user.refreshToken.filter((t) => t !== refreshToken),
      },
    });
    setCookie(c, "authToken", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    setCookie(c, "refreshToken", "", {
      httpOnly: true,
      path: "/api/auth/refresh",
      maxAge: 0,
    });

    return c.json({ message: "Logout successful", data: null }, 200);
  } catch (error) {
    return c.json({ message: "Invalid token", data: null }, 400);
  }
}

export { Logout };
