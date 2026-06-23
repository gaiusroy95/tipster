export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-5" role="separator" aria-label={label}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <span className="w-full border-t border-border-default/80" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-bg-surface px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </span>
      </div>
    </div>
  )
}
