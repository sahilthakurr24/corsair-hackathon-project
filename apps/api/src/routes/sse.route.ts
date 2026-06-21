import express, { Router } from "express";
import {sseHandler} from "../controller/sse/index"
const router:Router = express.Router();


router.get("/events", sseHandler);

export default router;