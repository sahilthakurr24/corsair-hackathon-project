"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icon";

const options = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Avoid a hydration mismatch: theme is only known on the client.
  const currentIcon = mounted && resolvedTheme === "dark" ? "moon" : "sun";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Toggle theme"
        aria-expanded={open}
        className="grid h-8 w-8 place-items-center rounded-lg border border-[#dde5ee] bg-white text-[#475467] hover:border-[#b7d6fb] hover:text-brand-blue dark:border-dk-border dark:bg-dk-surface dark:text-dk-muted dark:hover:border-[#3a4a5e]"
      >
        <Icon name={currentIcon} size={15} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-36 overflow-hidden rounded-lg border border-[#e4e9f0] bg-white p-1 shadow-[0_10px_30px_rgba(20,39,63,0.16)] dark:border-dk-border dark:bg-dk-surface">
          {options.map((option) => {
            const active = (mounted ? theme : "system") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-[7px] text-[11px] ${
                  active
                    ? "bg-[#eaf4ff] font-semibold text-brand-blue dark:bg-[#16263b]"
                    : "text-[#475467] hover:bg-[#f4f7fb] dark:text-dk-muted dark:hover:bg-dk-surface-2"
                }`}
              >
                <Icon name={option.icon} size={14} />
                {option.label}
                {active && (
                  <span className="ml-auto">
                    <Icon name="check" size={13} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
