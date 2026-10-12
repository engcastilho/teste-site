import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Rótulo + ajuda + mensagem de erro de um campo de formulário. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string[];
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive" aria-hidden>*</span>}
      </Label>
      {children}
      {hint && !error?.length && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {error?.length ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}
