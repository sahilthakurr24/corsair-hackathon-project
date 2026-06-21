export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-[#e7ecf2] dark:bg-[#222b35] ${className}`}
    />
  );
}
