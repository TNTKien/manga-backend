import prisma from "@/services/prisma";
import { TDataResponse } from "@/types/response";
import { THonoContext } from "@/types/hono";
import { Tags } from "@prisma/client";

async function getTags(c: THonoContext): TDataResponse<string[]> {
  const tagsArr = Object.keys(Tags).filter(
    (value) => isNaN(Number(value)) === true
  );
  return c.json(
    {
      message: "Tags fetched successfully",
      data: tagsArr,
    },
    200
  );
}

export { getTags };
