import type { Context, TypedResponse } from "hono";
import prisma from "@/services/prisma";
import { hashPassword } from "@/utils/hashPassword";

type TRegisterResponse = {
  message: string;
};

type TRegisterBody = {
  email: string;
  password: string;
  username: string;
};

async function register(
  c: Context
): Promise<Response & TypedResponse<TRegisterResponse>> {
  try {
    const { email, password, username } = (await c.req.json()) as TRegisterBody;

    if (!email || !password || !username) {
      return c.json({ message: "Missing required fields" }, 400);
    }

    if (await isExistingUser(email, username)) {
      return c.json({ message: "User already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    return c.json({ message: "User created successfully" }, 201);
  } catch (error) {
    return c.json({ message: "An error occurred" }, 500);
  }
}

async function isExistingUser(
  email: string,
  username: string
): Promise<boolean> {
  try {
    await prisma.user.findFirstOrThrow({
      where: {
        OR: [
          {
            email,
          },
          {
            username,
          },
        ],
      },
    });
    return true;
  } catch (error) {
    return false;
  }
}

export { register };
