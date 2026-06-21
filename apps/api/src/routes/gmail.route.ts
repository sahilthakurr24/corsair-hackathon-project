import express, { Router } from "express";
import { getMessage, getMessages } from "../controller/gmail/index";
import {
  createDraft,
  deleteDraft,
  getDraft,
  listDrafts,
  sendDraft,
  updateDraft,
} from "../controller/gmail/drafts";
const router: Router = express.Router();

router.get("/get-messages", getMessages);
router.get("/get-message/:id", getMessage);

router.get("/drafts", listDrafts);
router.post("/drafts", createDraft);
router.get("/drafts/:id", getDraft);
router.put("/drafts/:id", updateDraft);
router.delete("/drafts/:id", deleteDraft);
router.post("/drafts/:id/send", sendDraft);

export default router;
