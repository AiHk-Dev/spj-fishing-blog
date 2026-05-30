/*
 * Design Philosophy: Dark Maritime Minimalism
 * SPJ Logo: Typography-focused mark — bold "SPJ" lettering with
 * a teal accent underline wave and subtle depth ring.
 * Clean, modern, and instantly recognizable at any size.
 */

interface SPJLogoProps {
  size?: number;
  className?: string;
}

export default function SPJLogo({ size = 40, className = "" }: SPJLogoProps) {
  const scale = size / 40;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, oklch(0.65 0.15 190), oklch(0.45 0.12 220))",
          padding: "2px",
        }}
      >
        <div className="w-full h-full rounded-full bg-[oklch(0.08_0.025_240)]" />
      </div>

      {/* Inner subtle ring */}
      <div
        className="absolute rounded-full border border-[oklch(0.65_0.15_190/0.2)]"
        style={{
          inset: `${3 * scale}px`,
        }}
      />

      {/* SPJ Text — the main mark */}
      <span
        className="relative font-['Space_Mono'] font-bold text-[oklch(0.65_0.15_190)] tracking-tight leading-none"
        style={{
          fontSize: `${size * 0.32}px`,
          textShadow: "0 0 8px oklch(0.65 0.15 190 / 0.4)",
        }}
      >
        SPJ
      </span>

      {/* Accent wave underline beneath text */}
      <svg
        className="absolute"
        style={{
          bottom: `${7 * scale}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${size * 0.55}px`,
          height: `${4 * scale}px`,
        }}
        viewBox="0 0 22 4"
        fill="none"
      >
        <path
          d="M 1 2.5 Q 5.5 0.5 11 2.5 Q 16.5 4.5 21 2.5"
          stroke="oklch(0.75 0.12 55)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
