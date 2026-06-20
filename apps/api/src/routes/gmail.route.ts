import express, { Router } from "express";
import { getMessage, getMessages } from "../controller/gmail/index";
const router: Router = express.Router();

router.get("/get-messages", getMessages);
router.get("/get-message/:id", getMessage);

export default router;
