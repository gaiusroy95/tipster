export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border-default" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-bg-card px-2 text-text-muted">{label}</span>
      </div>
    </div>
  )
}
