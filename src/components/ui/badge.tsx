type BadgeVariant = "default" | "success" | "danger" | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-text-muted",
  success: "bg-success/20 text-success",
  danger: "bg-danger/20 text-danger",
  accent: "bg-accent/20 text-accent",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
