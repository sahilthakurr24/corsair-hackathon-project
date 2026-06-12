import { Router } from "express";
import { handleCorsairWebhook } from "../controller/corsair-webhook";

const router: Router = Router();

router.post("/corsair", handleCorsairWebhook);

export default router;
