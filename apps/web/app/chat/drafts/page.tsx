import type { Metadata } from "next";
import { ComingSoonView } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Drafts — CalMail",
  description: "Review AI-drafted replies before sending.",
};

export default function DraftsPage() {
  return (
    <ComingSoonView
      icon="mail"
      title="Drafts"
      description="Review and send AI-drafted replies before they go out."
    />
  );
}
