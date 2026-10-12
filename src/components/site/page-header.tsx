export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-brand/[0.07] to-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow && <p className="mb-2 text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}
