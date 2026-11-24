// Social network logos in their official colours.

const INSTAGRAM_GRADIENT =
  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)";

/** Instagram: official gradient with the white camera glyph. */
export function InstagramLogo({
  className = "",
  shape = "circle",
}: {
  className?: string;
  shape?: "circle" | "square";
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center text-white ${shape === "circle" ? "rounded-full" : "rounded-[30%]"} ${className}`}
      style={{ background: INSTAGRAM_GRADIENT }}
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

/** Facebook: official blue circle with the white "f". */
export function FacebookLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="11.7" fill="#ffffff" />
      <path
        fill="#1877F2"
        d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
      />
    </svg>
  );
}

export function SocialLogo({
  id,
  className,
  shape,
}: {
  id: string;
  className?: string;
  shape?: "circle" | "square";
}) {
  return id === "facebook" ? (
    <FacebookLogo className={className} />
  ) : (
    <InstagramLogo className={className} shape={shape} />
  );
}
