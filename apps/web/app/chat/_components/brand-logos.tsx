export function GmailLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M6 38V14.5l4-3v26.5H7a1 1 0 0 1-1-1Z"
      />
      <path fill="#34A853" d="M38 38h-3V11.5l4 3V37a1 1 0 0 1-1 1Z" />
      <path fill="#FBBC04" d="M35 11.5V20l-11 8.5L13 20v-8.5l11 8.5 11-8.5Z" />
      <path
        fill="#EA4335"
        d="M10 11.5 24 22l14-10.5V11a3 3 0 0 0-3-3h-.5L24 16 13.5 8H13a3 3 0 0 0-3 3v.5Z"
      />
      <path
        fill="#C5221F"
        d="M10 11.5 6 14.5V11a3 3 0 0 1 3-3h4l-3 3.5Z"
        opacity="0"
      />
    </svg>
  );
}

export function GoogleCalendarLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path fill="#fff" d="M34 14H14v20h20V14Z" />
      <path fill="#EA4335" d="M34 8H14l-3 3v3h26v-3a3 3 0 0 0-3-3Z" />
      <path fill="#4285F4" d="M11 14v20a3 3 0 0 0 3 3h3V14h-6Z" />
      <path fill="#34A853" d="M37 14H31v23h3a3 3 0 0 0 3-3V14Z" />
      <path fill="#188038" d="M31 34v3H17v-3h14Z" />
      <path fill="#1967D2" d="M37 14v-3a3 3 0 0 0-3-3h-3v6h6Z" />
      <path
        fill="#4285F4"
        d="M21.7 27.5c-.5 0-1-.1-1.4-.3a2.4 2.4 0 0 1-1-.8 2.3 2.3 0 0 1-.4-1.1h1.5c0 .3.2.5.4.7.2.2.5.3.9.3.3 0 .6-.1.8-.3.2-.2.3-.4.3-.7 0-.3-.1-.6-.4-.8-.2-.2-.6-.3-1-.3h-.5v-1.2h.5c.4 0 .7-.1.9-.3.2-.2.3-.4.3-.7 0-.3-.1-.5-.3-.6a1 1 0 0 0-.7-.3c-.3 0-.6.1-.8.3-.2.2-.3.4-.3.6h-1.5c0-.4.2-.8.4-1.1.2-.3.5-.6 1-.8.4-.2.8-.3 1.3-.3.5 0 1 .1 1.3.3.4.2.7.4.9.7.2.3.3.7.3 1.1 0 .4-.1.8-.4 1-.2.3-.5.5-.9.6.5.1.8.3 1.1.6.3.3.4.7.4 1.2 0 .4-.1.8-.3 1.1-.2.3-.6.6-1 .8-.4.2-.9.3-1.4.3Zm6.4-.1v-5.6l-1.5 1v-1.5l1.7-1.2h1.3v7.3h-1.5Z"
      />
    </svg>
  );
}
