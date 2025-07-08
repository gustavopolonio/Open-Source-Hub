import { Star, Triangle, Bookmark, Edit, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  star: Star,
  triangle: Triangle,
  bookmark: Bookmark,
  edit: Edit,
  settings2: Settings2,
};

type IconName = keyof typeof iconMap;

type IconProps = {
  name: IconName;
  size?: "sm" | "md" | "lg";
  outlineColor?: string;
  fill?: string;
  onClick?: () => void;
  className?: string;
};

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

const cssVars = ["primary"];

function resolveColor(color?: string) {
  if (!color) return undefined;
  return cssVars.includes(color) ? `var(--${color})` : color;
}

export function Icon({
  name,
  outlineColor = "transparent",
  fill = "transparent",
  onClick,
  className,
  size = "lg",
  ...props
}: IconProps) {
  const LucideIcon = iconMap[name];
  const Comp = onClick ? "button" : "span";

  return (
    <Comp
      onClick={onClick}
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      <LucideIcon
        className="w-full h-auto"
        color={resolveColor(outlineColor)}
        fill={resolveColor(fill)}
      />
    </Comp>
  );
}
