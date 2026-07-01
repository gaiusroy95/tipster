import { z } from 'zod';

const MAX_FORUM_IMAGE_DATA_URL_LENGTH = 7_000_000;

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidForumImageUrl(value: string): boolean {
  if (value.startsWith('data:image/')) {
    return value.length <= MAX_FORUM_IMAGE_DATA_URL_LENGTH;
  }
  return isHttpUrl(value);
}

const forumImageUrlField = z
  .string()
  .trim()
  .refine(isValidForumImageUrl, 'Enter a valid image URL');
const tagField = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .transform((v) => v.toLowerCase().replace(/\s+/g, '-'));

export const attachmentSchema = z
  .object({
    type: z.enum(['image', 'link', 'file']),
    url: z.string().trim().min(1),
    title: z.string().trim().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    const valid = data.type === 'image' ? isValidForumImageUrl(data.url) : isHttpUrl(data.url);
    if (!valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: data.type === 'image' ? 'Enter a valid image URL' : 'Enter a valid URL',
        path: ['url'],
      });
    }
  });

export const pollSchema = z.object({
  question: z.string().trim().min(3).max(200),
  options: z.array(z.string().trim().min(1).max(80)).min(2).max(6),
  endsAt: z.string().datetime().optional(),
});

const forumPostFieldsSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  body: z.string().trim().min(10, 'Post must be at least 10 characters').max(10000),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  scheduledAt: z.string().datetime().optional(),
  coverImageUrl: forumImageUrlField.optional(),
  categoryId: z.string().trim().optional(),
  tags: z.array(tagField).max(5).optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
  poll: pollSchema.optional(),
});

export const createForumPostSchema = forumPostFieldsSchema
  .extend({
    status: z.enum(['draft', 'scheduled', 'published']).optional().default('published'),
    tags: z.array(tagField).max(5).optional().default([]),
    attachments: z.array(attachmentSchema).max(10).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'scheduled') {
      if (!data.scheduledAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Scheduled posts require a publish date',
          path: ['scheduledAt'],
        });
        return;
      }
      if (new Date(data.scheduledAt) <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Schedule time must be in the future',
          path: ['scheduledAt'],
        });
      }
    }
  });

export const updateForumPostSchema = forumPostFieldsSchema.partial();

export const listForumPostsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
});

export const createForumCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  parentId: z.string().trim().optional(),
});

export const updateForumCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const voteForumPollSchema = z.object({
  optionId: z.string().trim().min(1),
});

export type CreateForumPostInput = z.infer<typeof createForumPostSchema>;
export type UpdateForumPostInput = z.infer<typeof updateForumPostSchema>;
