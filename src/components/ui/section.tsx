import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "muted" | "cream";
}

export function Section({ children, className, id, variant = "default" }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-24 md:py-32 lg:py-40",
        variant === "muted" && "bg-secondary/30",
        variant === "cream" && "bg-gradient-cream",
        className
      )}
    >
      <div className="container max-w-6xl mx-auto px-6">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "max-w-3xl mb-16 md:mb-20 transition-all duration-1000",
        align === "center" && "mx-auto text-center",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {subtitle && (
        <span className="inline-block text-primary font-medium text-sm tracking-wide mb-4">
          {subtitle}
        </span>
      )}
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
