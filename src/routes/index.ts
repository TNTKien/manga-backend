import status from "@/app/health";
import auth from "@/app/auth";
import upload from "@/app/upload";
import manga from "@/app/manga";
import chapter from "@/app/chapter";
import { Hono } from "hono";

function app(context: Hono) {
  context.route("/health", status);
  context.route("/auth", auth);
  context.route("/upload", upload);
  context.route("/manga", manga);
  context.route("/chapter", chapter);
  return context;
}

export default app;
