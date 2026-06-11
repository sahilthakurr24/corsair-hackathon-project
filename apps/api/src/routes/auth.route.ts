import { Router } from "express";
import { me, register, syncUser } from "../controller/auth";
import {
  completeGoogleOAuthCallback,
  disconnectGoogleConnection,
  getGoogleConnectionStatus,
  startGoogleOAuth,
} from "../controller/google-oauth";

const router: Router = Router();

router.get("/me", me);
router.post("/register", register);
router.post("/sync", syncUser);
router.get("/google/status", getGoogleConnectionStatus);
router.post("/google/oauth/start", startGoogleOAuth);
router.get("/google/oauth/callback", completeGoogleOAuthCallback);
router.delete("/google/connections/:plugin", disconnectGoogleConnection);

export default router;
