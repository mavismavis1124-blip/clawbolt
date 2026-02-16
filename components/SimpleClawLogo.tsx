type LogoSize = "sm" | "md" | "lg";

interface SimpleClawLogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
  iconClassName?: string;
}

const sizeMap: Record<LogoSize, { icon: string; text: string }> = {
  sm: { icon: "w-7 h-7", text: "text-base" },
  md: { icon: "w-8 h-8", text: "text-lg" },
  lg: { icon: "w-10 h-10", text: "text-xl" },
};

export function SimpleClawLogo({
  size = "md",
  showWordmark = true,
  className = "",
  iconClassName = "",
}: SimpleClawLogoProps) {
  const resolved = sizeMap[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative ${resolved.icon} rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center ${iconClassName}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.2 17.6C6.8 15.7 8.4 14.8 10.4 14.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-accent"
          />
          <path
            d="M8.6 18.4C9.6 16.9 10.8 16.1 12.2 15.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-accent"
          />
          <path
            d="M12 18.4C12.7 17.3 13.4 16.7 14.3 16.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-accent"
          />
          <path
            d="M8.8 12.2C9.7 9.3 11.4 7.7 14.5 6.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-text-primary"
          />
          <circle cx="15.8" cy="7" r="1.2" className="fill-accent" />
        </svg>
      </span>

      {showWordmark && (
        <span className={`font-semibold tracking-tight text-text-primary ${resolved.text}`}>
          SimpleClaw
        </span>
      )}
    </span>
  );
}
