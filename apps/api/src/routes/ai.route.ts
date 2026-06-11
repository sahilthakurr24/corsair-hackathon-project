import { Router } from "express";
import { chat } from "../controller/ai";

const router: Router = Router();

router.post("/chat", chat);

export default router;
