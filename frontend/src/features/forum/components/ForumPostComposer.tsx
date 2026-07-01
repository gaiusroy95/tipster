import { useState } from 'react'
import {
  CalendarDaysIcon,
  ChartBarIcon,
  PaperClipIcon,
  PhotoIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { useForumCategories, uploadForumImage } from '@/features/forum/hooks/useForum'
import type { CreateForumPostPayload, ForumPostStatus } from '@/features/forum/types/forum'
import { cn } from '@/shared/utils/cn'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'

interface ForumPostComposerProps {
  onSubmit: (payload: CreateForumPostPayload) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

function ComposerSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: typeof TagIcon
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-border-default/60 bg-bg-elevated/30">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
        <Icon className="h-4 w-4 text-accent-secondary" aria-hidden="true" />
        {title}
        <span className="ml-auto text-xs font-normal text-text-muted group-open:hidden">Show</span>
        <span className="ml-auto hidden text-xs font-normal text-text-muted group-open:inline">Hide</span>
      </summary>
      <div className="border-t border-border-default/50 px-4 pb-4 pt-3">{children}</div>
    </details>
  )
}

const selectClass =
  'mt-1.5 w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-accent-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-secondary/30'

const textareaClass =
  'mt-1.5 w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-accent-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-secondary/30 resize-y min-h-[140px]'

export function ForumPostComposer({ onSubmit, isLoading, onCancel }: ForumPostComposerProps) {
  const { data: categories } = useForumCategories()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<ForumPostStatus>('published')
  const [scheduledAt, setScheduledAt] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [attachments, setAttachments] = useState<
    { type: 'image' | 'link' | 'file'; url: string; title?: string }[]
  >([])
  const [attachUrl, setAttachUrl] = useState('')
  const [attachTitle, setAttachTitle] = useState('')
  const [attachType, setAttachType] = useState<'image' | 'link' | 'file'>('image')
  const [pollEnabled, setPollEnabled] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [coverUploading, setCoverUploading] = useState(false)
  const [attachUploading, setAttachUploading] = useState(false)

  const handleCoverFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error')
      return
    }
    setCoverUploading(true)
    try {
      const url = await uploadForumImage(file)
      setCoverImageUrl(url)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to upload cover image'
      toast(msg, 'error')
    } finally {
      setCoverUploading(false)
    }
  }

  const handleAttachFile = async (file: File | undefined) => {
    if (!file || attachType !== 'image') return
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error')
      return
    }
    setAttachUploading(true)
    try {
      const url = await uploadForumImage(file)
      setAttachUrl(url)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to upload image'
      toast(msg, 'error')
    } finally {
      setAttachUploading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || tags.includes(tag) || tags.length >= 5) return
    setTags([...tags, tag])
    setTagInput('')
  }

  const addAttachment = () => {
    if (!attachUrl.trim()) return
    setAttachments([
      ...attachments,
      { type: attachType, url: attachUrl.trim(), title: attachTitle.trim() || undefined },
    ])
    setAttachUrl('')
    setAttachTitle('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload: CreateForumPostPayload = {
      title: title.trim(),
      body: body.trim(),
      status,
      coverImageUrl: coverImageUrl.trim() || undefined,
      categoryId: categoryId || undefined,
      tags,
      attachments,
    }
    if (status === 'scheduled' && scheduledAt) {
      payload.scheduledAt = new Date(scheduledAt).toISOString()
    }
    if (pollEnabled && pollQuestion.trim() && pollOptions.filter(Boolean).length >= 2) {
      payload.poll = {
        question: pollQuestion.trim(),
        options: pollOptions.map((o) => o.trim()).filter(Boolean),
      }
    }
    await onSubmit(payload)
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="overflow-hidden rounded-2xl border border-accent-secondary/20 bg-bg-surface shadow-card"
    >
      <div className="border-b border-border-default/60 bg-bg-elevated/40 px-5 py-4 sm:px-6">
        <h2 className="font-display text-lg font-bold text-text-primary">Create post</h2>
        <p className="mt-0.5 text-sm text-text-muted">
          Write clearly — good titles and categories help others find your content.
        </p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <Label htmlFor="forum-title" className="text-text-primary">
            Title
          </Label>
          <Input
            id="forum-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="What's your post about?"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="forum-body" className="text-text-primary">
            Content
          </Label>
          <textarea
            id="forum-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            maxLength={10000}
            placeholder="Share your analysis, picks, or thoughts…"
            className={textareaClass}
          />
          <p className="mt-1 text-right text-xs text-text-muted">{body.length.toLocaleString()} / 10,000</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="forum-category">Category</Label>
            <select
              id="forum-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="forum-cover-file" className="inline-flex items-center gap-1.5">
              <PhotoIcon className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              Cover image
            </Label>
            <div className="mt-1.5 flex flex-col gap-2">
              <input
                id="forum-cover-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={coverUploading || isLoading}
                onChange={(e) => {
                  void handleCoverFile(e.target.files?.[0])
                  e.target.value = ''
                }}
                className="block w-full text-xs text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent-secondary/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-accent-secondary hover:file:bg-accent-secondary/25"
              />
              <Input
                id="forum-cover"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Or paste image URL"
              />
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="max-h-40 w-full rounded-lg border border-border-default/60 object-cover"
                />
              )}
            </div>
          </div>
        </div>

        <ComposerSection title="Tags" icon={TagIcon}>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. premier-league"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addTag} disabled={tags.length >= 5}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-2.5 py-1 text-xs font-medium text-accent-secondary"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    aria-label={`Remove ${tag}`}
                    className="rounded-full hover:bg-accent-secondary/20 p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-text-muted">Up to 5 tags. Press Enter to add quickly.</p>
        </ComposerSection>

        <ComposerSection title="Media & attachments" icon={PaperClipIcon} defaultOpen>
          <div className="grid gap-3 sm:grid-cols-4">
            <select
              value={attachType}
              onChange={(e) => setAttachType(e.target.value as typeof attachType)}
              className={cn(selectClass, 'mt-0 sm:col-span-1')}
            >
              <option value="image">Image</option>
              <option value="link">Link</option>
              <option value="file">File</option>
            </select>
            {attachType === 'image' && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={attachUploading || isLoading}
                onChange={(e) => {
                  void handleAttachFile(e.target.files?.[0])
                  e.target.value = ''
                }}
                className="sm:col-span-2 block w-full text-xs text-text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-accent-secondary/15 file:px-2 file:py-1.5 file:text-[11px] file:font-semibold file:text-accent-secondary"
              />
            )}
            <Input
              value={attachUrl}
              onChange={(e) => setAttachUrl(e.target.value)}
              placeholder={attachType === 'image' ? 'Or paste image URL' : 'URL'}
              className={attachType === 'image' ? 'sm:col-span-4' : 'sm:col-span-2'}
            />
            <Button type="button" variant="secondary" onClick={addAttachment} className="sm:col-span-1">
              Add
            </Button>
            <Input
              value={attachTitle}
              onChange={(e) => setAttachTitle(e.target.value)}
              placeholder="Display title (optional)"
              className="sm:col-span-4"
            />
          </div>
          {attachments.length > 0 && (
            <ul className="mt-3 space-y-2">
              {attachments.map((a, i) => (
                <li
                  key={`${a.url}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border-default/60 bg-bg-elevated/50 px-3 py-2 text-sm"
                >
                  <span className="truncate text-text-muted">
                    <span className="font-medium uppercase text-[10px] tracking-wide text-accent-secondary">
                      {a.type}
                    </span>{' '}
                    {a.title ?? a.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                    className="shrink-0 text-xs font-medium text-accent-loss hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ComposerSection>

        <ComposerSection title="Poll" icon={ChartBarIcon} defaultOpen={false}>
          <label className="flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={pollEnabled}
              onChange={(e) => setPollEnabled(e.target.checked)}
              className="rounded border-border-default text-accent-secondary focus:ring-accent-secondary/30"
            />
            Include a poll with this post
          </label>
          {pollEnabled && (
            <div className="mt-3 space-y-2">
              <Input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll question"
              />
              {pollOptions.map((opt, i) => (
                <Input
                  key={i}
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions]
                    next[i] = e.target.value
                    setPollOptions(next)
                  }}
                  placeholder={`Option ${i + 1}`}
                />
              ))}
              {pollOptions.length < 6 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                >
                  Add option
                </Button>
              )}
            </div>
          )}
        </ComposerSection>

        <div className="rounded-xl border border-border-default/60 bg-bg-elevated/30 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="forum-status" className="inline-flex items-center gap-1.5">
                <CalendarDaysIcon className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                When to publish
              </Label>
              <select
                id="forum-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ForumPostStatus)}
                className={selectClass}
              >
                <option value="published">Publish now</option>
                <option value="draft">Save as draft</option>
                <option value="scheduled">Schedule for later</option>
              </select>
            </div>
            {status === 'scheduled' && (
              <div>
                <Label htmlFor="forum-schedule">Schedule date & time</Label>
                <Input
                  id="forum-schedule"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-default/60 bg-bg-elevated/30 px-5 py-4 sm:px-6">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={title.trim().length < 3 || body.trim().length < 10}
        >
          {status === 'draft' ? 'Save draft' : status === 'scheduled' ? 'Schedule post' : 'Publish post'}
        </Button>
      </div>
    </form>
  )
}
