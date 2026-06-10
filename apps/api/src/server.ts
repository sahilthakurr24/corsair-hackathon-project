import express, { type Express } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler, notFoundHandler } from "./middleware/error";
import authRouter from "./routes/auth.route";

export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.json({ health: true });
});

app.use("/auth", authRouter);
app.use(notFoundHandler);
app.use(errorHandler);
