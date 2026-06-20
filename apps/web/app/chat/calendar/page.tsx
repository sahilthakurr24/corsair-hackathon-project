import type { Metadata } from "next";
import { ComingSoonView } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Calendar — CalMail",
  description: "Manage your schedule through CalMail.",
};

export default function CalendarPage() {
  return (
    <ComingSoonView
      icon="calendar"
      title="Calendar"
      description="View and manage your meetings alongside your inbox."
    />
  );
}
