import { Context, TypedResponse } from "hono";

export type Variables = {
  userId: string;
};
export type THonoContext = Context<{ Variables: Variables }>;
