import express, { type Express } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler, notFoundHandler } from "./middleware/error";
import aiRouter from "./routes/ai.route";
import authRouter from "./routes/auth.route";
import { env } from "./env";

export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  }),
);
app.use(
  clerkMiddleware({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ health: true });
});

app.use("/auth", authRouter);
app.use("/ai", aiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
