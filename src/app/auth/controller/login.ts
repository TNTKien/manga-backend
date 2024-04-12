import type { Context, TypedResponse } from "hono";
import prisma from "@/services/prisma";
import type { User } from "@prisma/client";
import { generateToken, generateRefreshToken } from "@/utils/jwt";
import { setCookie } from "hono/cookie";
import { checkPassword } from "@/utils/hashPassword";

type TLoginResponse = {
  message: string;
};

type TLoginBody = {
  email: string;
  password: string;
};

type TLoginSuccess = TLoginResponse & {
  authToken: string;
  refreshToken: string;
};

type Token = {
  authToken: string;
  refreshToken: string;
};

async function login(
  c: Context
): Promise<Response & TypedResponse<TLoginResponse | TLoginSuccess>> {
  try {
    const { email, password } = (await c.req.json()) as TLoginBody;

    if (!email || !password) {
      return c.json({ message: "Missing required fields" }, 400);
    }

    const user = await getUser(email);
    if (!user) {
      return c.json({ message: "Invalid credentials" }, 400);
    }

    if (!(await checkPassword(password, user.password))) {
      return c.json({ message: "Invalid credentials" }, 400);
    }

    const token = generate(user);
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        refreshToken: [token.refreshToken, ...user.refreshToken],
      },
    });

    setCookie(c, "refreshToken", token.refreshToken, {
      httpOnly: true,
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
    });
    setCookie(c, "authToken", token.authToken, {
      httpOnly: true,
      path: "/",
      maxAge: 0 * 60 * 24 * 30,
    });

    return c.json(
      {
        message: "Login successful",
        authToken: token.authToken,
        refreshToken: token.refreshToken,
      },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred" }, 500);
  }
}

async function getUser(email: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }
  return user;
}

function generate(user: Pick<User, "id" | "role" | "username">): Token {
  const authToken = generateToken({
    id: user.id,
    role: user.role,
    username: user.username,
  });
  const refreshToken = generateRefreshToken({ iat: Date.now() });

  return {
    authToken,
    refreshToken,
  };
}

export { login };
