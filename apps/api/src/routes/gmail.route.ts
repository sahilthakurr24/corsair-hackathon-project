import express, { Router } from "express";
import { getMessages } from "../controller/gmail/index";
const router: Router = express.Router();

router.get("/get-messages", getMessages);

export default router;
