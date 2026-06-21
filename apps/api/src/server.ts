import express, { type Express } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler, notFoundHandler } from "./middleware/error";
import chatRouter from "./routes/chat.route";
import authRouter from "./routes/auth.route";
import webhookRouter from "./routes/webhook.route";
import sseRouter from "./routes/sse.route";
import gmailRouter from "./routes/gmail.route";
import googleCalendarRouter from "./routes/calendar.route";
import overviewRouter from "./routes/overview.route";
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
app.use("/webhooks", webhookRouter);
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
app.use("/ai", chatRouter);
app.use("/sse", sseRouter);
app.use("/gmail", gmailRouter);
app.use("/calendar", googleCalendarRouter);
app.use("/overview", overviewRouter);
app.use(notFoundHandler);
app.use(errorHandler);
