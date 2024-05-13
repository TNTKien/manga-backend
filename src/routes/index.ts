import status from "@/app/health";
import auth from "@/app/auth";
import manga from "@/app/manga";
import chapter from "@/app/chapter";
import search from "@/app/search";
import view from "@/app/views";
import tags from "@/app/tags";
import user from "@/app/user";
import { Hono } from "hono";
import { Variables } from "@/types/hono";

function app(context: Hono<{ Variables: Variables }>) {
  context.route("/health", status);
  context.route("/auth", auth);
  context.route("/manga", manga);
  context.route("/chapter", chapter);
  context.route("/search", search);
  context.route("/view", view);
  context.route("/tags", tags);
  context.route("/user", user);
  return context;
}

export default app;
