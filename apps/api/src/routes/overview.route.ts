import express, { Router } from "express";
import { getOverview } from "../controller/overview";

const router: Router = express.Router();

router.get("/", getOverview);

export default router;
