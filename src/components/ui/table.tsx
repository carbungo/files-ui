interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: TableProps) {
  return <thead className="border-b border-border text-left text-text-muted">{children}</thead>;
}

export function TableBody({ children }: TableProps) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TableRow({ children, className = "" }: TableProps) {
  return <tr className={`h-12 ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = "" }: TableProps) {
  return <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>;
}

export function TableCell({ children, className = "" }: TableProps) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
