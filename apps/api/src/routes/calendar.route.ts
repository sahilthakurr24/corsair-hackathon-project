import express, { Router } from "express";
import { getCalendarEvents } from "../controller/calender";

const router :Router = express.Router();


router.get('/events', getCalendarEvents);

export default router;