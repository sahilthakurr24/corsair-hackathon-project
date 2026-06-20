import type { Metadata } from "next";
import { ComingSoonView } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Contacts — CalMail",
  description: "See the people you talk to most.",
};

export default function ContactsPage() {
  return (
    <ComingSoonView
      icon="contacts"
      title="Contacts"
      description="See the people you talk to most across email and calendar."
    />
  );
}
