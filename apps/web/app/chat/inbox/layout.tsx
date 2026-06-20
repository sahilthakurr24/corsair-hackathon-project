import { InboxCacheProvider } from "./_components/inbox-cache";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return <InboxCacheProvider>{children}</InboxCacheProvider>;
}
