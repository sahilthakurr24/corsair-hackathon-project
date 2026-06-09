import express, { type Express } from "express";
import cors from "cors";
export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ health: true });
});
