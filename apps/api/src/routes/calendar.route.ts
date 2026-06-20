import express, { Router } from "express";
import { getCalendarEvents } from "../controller/calendar";

const router: Router = express.Router();

router.get("/events", getCalendarEvents);

export default router;