import type { Metadata } from "next";
import { ComingSoonView } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Tasks — CalMail",
  description: "Track action items CalMail finds in your inbox.",
};

export default function TasksPage() {
  return (
    <ComingSoonView
      icon="tasks"
      title="Tasks"
      description="Track action items CalMail finds in your inbox and calendar."
    />
  );
}
