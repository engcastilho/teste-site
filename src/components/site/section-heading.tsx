import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow && <p className="text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>}
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {description && <p className="text-base text-slate-600">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg text-sm font-semibold text-brand hover:underline sm:self-auto"
        >
          {linkLabel ?? "Ver todos"}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
