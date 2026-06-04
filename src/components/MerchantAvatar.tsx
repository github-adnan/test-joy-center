import { useEffect, useRef } from "react";

interface Props {
  name: string;
  image?: string;
  size?: number;
  className?: string;
}

// Deterministic colorful initial avatar; uses uploaded image if provided.
export function MerchantAvatar({ name, image, size = 56, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    ref.current.style.background = `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 45%))`;
  }, [name]);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      ref={ref}
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden grid place-items-center text-white font-semibold shrink-0 ${className}`}
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.36 }}>{initials || "M"}</span>
      )}
    </div>
  );
}
