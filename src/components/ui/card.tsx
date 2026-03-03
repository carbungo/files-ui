interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={className}>{children}</div>;
}
