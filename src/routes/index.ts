import status from "@/app/health";
import auth from "@/app/auth";
import upload from "@/app/upload";
import { Hono } from "hono";

function app(context: Hono) {
  context.route("/health", status);
  context.route("/auth", auth);
  context.route("/upload", upload);
}

export default app;
