import { cn } from "@/lib/utils";

type TypographyProps = {
  variant?: "h1" | "h2" | "h3" | "p" | "muted" | "blockquote";
  className?: string;
  children: React.ReactNode;
};

const variantClasses = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  muted: "text-sm text-muted-foreground",
  blockquote: "mt-6 border-l-2 pl-6 italic",
};

export function Typography({
  variant = "p",
  className,
  children,
}: TypographyProps) {
  const Tag = variant === "muted" ? "p" : variant;
  return (
    <Tag className={cn(variantClasses[variant], className)}>{children}</Tag>
  );
}
