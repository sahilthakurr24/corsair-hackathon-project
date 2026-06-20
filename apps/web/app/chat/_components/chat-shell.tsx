"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type ChatShellContextValue = {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  newChatSignal: number;
  startNewChat: () => void;
};

const ChatShellContext = createContext<ChatShellContextValue | null>(null);

export function ChatShellProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newChatSignal, setNewChatSignal] = useState(0);

  const value: ChatShellContextValue = {
    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
    toggleSidebar: () => setSidebarOpen((open) => !open),
    newChatSignal,
    startNewChat: () => {
      setNewChatSignal((signal) => signal + 1);
      setSidebarOpen(false);
      router.push("/chat");
    },
  };

  return <ChatShellContext.Provider value={value}>{children}</ChatShellContext.Provider>;
}

export function useChatShell() {
  const context = useContext(ChatShellContext);
  if (!context) throw new Error("useChatShell must be used within ChatShellProvider");
  return context;
}
