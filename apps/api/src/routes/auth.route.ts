import { Router } from "express";
import { me, register } from "../controller/auth.controller";

const router: Router = Router();

router.get("/me", me);
router.post("/register", register);

export default router;
