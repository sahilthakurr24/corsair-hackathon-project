import express, { Router } from "express";
import {sseHandler} from "../controller/sse/index"
const router:Router = express.Router();


router.post("/events",sseHandler );

export default router;