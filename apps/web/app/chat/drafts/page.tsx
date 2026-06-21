import type { Metadata } from "next";
import { DraftsView } from "./drafts-view";

export const metadata: Metadata = {
  title: "Drafts — CalMail",
  description: "Compose, edit, and send your Gmail drafts.",
};

export default function DraftsPage() {
  return <DraftsView />;
}
