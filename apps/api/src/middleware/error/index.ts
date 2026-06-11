import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid request",
      issues: error.issues,
    });
  }

  console.error(error);

  if (typeof error === "object" && error !== null) {
    const status = "status" in error ? Number(error.status) : null;
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : null;
    const clerkErrors =
      "errors" in error && Array.isArray(error.errors) ? error.errors : null;

    if (status && status >= 400 && status < 500) {
      return res.status(status).json({
        error: message ?? "Request failed",
        errors: clerkErrors,
      });
    }
  }

  return res.status(500).json({
    error: "Internal server error",
  });
};
