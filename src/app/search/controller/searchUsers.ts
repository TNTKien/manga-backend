import prisma from "@/services/prisma";
import { THonoContext } from "@/types/hono";
import { TDataResponse } from "@/types/response";
import { User } from "@prisma/client";

async function searchUsers(c: THonoContext): TDataResponse<User[]> {
  const url = new URL(c.req.url);

  const query = url.searchParams.get("query");
  if (!query) {
    return c.json({ message: "Query is required", data: null }, 400);
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
        },
      },
    });

    return c.json({ message: "Users fetched successfully", data: users }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "An error occurred", data: null }, 500);
  }
}

export { searchUsers };
