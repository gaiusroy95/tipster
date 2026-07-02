import { useState, type ComponentType, type ReactNode } from 'react'
import {
  CheckIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  FingerPrintIcon,
} from '@heroicons/react/24/outline'
import {
  formatAuditTime,
  formatAuditEntityRef,
  formatMetadata,
  getActionCategory,
  getCategoryStyle,
  humanizeAction,
  humanizeEntityType,
  isDestructiveAction,
  type AdminAuditEntry,
} from '@/features/audit/lib/auditUtils'
import { Badge } from '@/shared/components/Badge'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { cn } from '@/shared/utils/cn'

export function AuditDossierPanel({ entry }: { entry: AdminAuditEntry | null }) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(label)
      window.setTimeout(() => setCopiedField(null), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!entry) {
    return (
      <aside className="audit-dossier relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-border-default/60 bg-bg-surface/50 p-8 text-center lg:sticky lg:top-6 lg:min-h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute inset-0 audit-dossier-idle" aria-hidden="true" />
        <div className="relative">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-accent-primary/10">
            <ClipboardDocumentListIcon className="h-10 w-10 text-cyan-300" aria-hidden="true" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">Open an event dossier</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
            Select any node on the timeline to inspect the full forensic record — operator identity,
            entity target, and sealed metadata payload.
          </p>
        </div>
      </aside>
    )
  }

  const category = getActionCategory(entry.action)
  const style = getCategoryStyle(category)
  const destructive = isDestructiveAction(entry.action)
  const metadata = formatMetadata(entry.metadata)
  const entityRef = formatAuditEntityRef(entry)

  return (
    <aside className="audit-dossier relative overflow-hidden rounded-[1.75rem] border border-border-default/60 bg-bg-surface/80 lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto admin-sidebar-scroll">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cyan-400/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative border-b border-border-default/50 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={destructive ? 'loss' : 'secondary'}>{style.label}</Badge>
          {destructive ? <Badge variant="loss">Critical</Badge> : null}
          <span className="ml-auto font-mono text-[11px] text-text-muted">{entry.id.slice(0, 12)}…</span>
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {humanizeAction(entry.action)}
        </h2>
        <p className="mt-2 font-mono text-xs text-text-muted">{formatAuditTime(entry.createdAt)}</p>
      </div>

      <div className="relative space-y-4 px-5 py-5 sm:px-6">
        <DossierSection title="Operator" icon={FingerPrintIcon}>
          <div className="flex items-center gap-3">
            <UserAvatar name={entry.admin.displayName} size="md" />
            <div className="min-w-0">
              <p className="font-semibold">{entry.admin.displayName}</p>
              <p className="truncate text-sm text-text-muted">@{entry.admin.username}</p>
              <p className="truncate font-mono text-xs text-text-muted">{entry.admin.email}</p>
            </div>
          </div>
        </DossierSection>

        <DossierSection title="Target entity" icon={ClipboardDocumentIcon}>
          <dl className="space-y-3 text-sm">
            <DossierRow label="Domain" value={humanizeEntityType(entry.entityType)} />
            {entityRef !== '—' ? <DossierRow label="Reference" value={entityRef} mono /> : null}
            <DossierRow label="Raw type" value={entry.entityType} mono />
            {entry.entityId ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Entity ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-text-primary">{entry.entityId}</dd>
                </div>
                <CopyButton
                  label="entityId"
                  copied={copiedField === 'entityId'}
                  onCopy={() => copy('entityId', entry.entityId!)}
                />
              </div>
            ) : (
              <DossierRow label="Entity ID" value="Not recorded" />
            )}
            <DossierRow label="Action code" value={entry.action} mono />
          </dl>
        </DossierSection>

        {metadata ? (
          <DossierSection title="Metadata payload" icon={DocumentDuplicateIcon}>
            <div className="relative">
              <pre className="audit-metadata-block overflow-x-auto rounded-xl border border-border-default/60 bg-bg-primary/60 p-4 font-mono text-[11px] leading-relaxed text-cyan-100/90">
                {metadata}
              </pre>
              <CopyButton
                label="metadata"
                copied={copiedField === 'metadata'}
                onCopy={() => copy('metadata', metadata)}
                className="absolute right-3 top-3"
              />
            </div>
          </DossierSection>
        ) : (
          <div className="rounded-xl border border-dashed border-border-default/60 px-4 py-6 text-center text-sm text-text-muted">
            No metadata attached to this event.
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-border-default/50 bg-bg-surface/95 px-5 py-3 backdrop-blur-md sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
          Sealed record · read-only
        </p>
      </div>
    </aside>
  )
}

function DossierSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border-default/50 bg-bg-primary/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}

function DossierRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className={cn('mt-1 text-text-primary', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  )
}

function CopyButton({
  label,
  copied,
  onCopy,
  className,
}: {
  label: string
  copied: boolean
  onCopy: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border-default/70 bg-bg-elevated/80 px-2 py-1 text-[10px] font-semibold text-text-muted transition-colors hover:text-text-primary',
        className,
      )}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <>
          <CheckIcon className="h-3.5 w-3.5 text-accent-win" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <DocumentDuplicateIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Copy
        </>
      )}
    </button>
  )
}
