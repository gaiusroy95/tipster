import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import {
  getViewerIdFromRequest,
  requireAuth,
  type AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { getClientIp } from '../lib/client-ip';
import {
  createForumCommentSchema,
  createForumPostSchema,
  listForumPostsSchema,
  updateForumCommentSchema,
  updateForumPostSchema,
  voteForumPollSchema,
} from '../schemas/forum.schemas';
import { forumService } from '../services/forum.service';

export const forumRouter = Router();

forumRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const data = await forumService.listCategories();
    res.json({ data });
  }),
);

forumRouter.get(
  '/tags',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit ?? 20);
    const data = await forumService.listPopularTags(limit);
    res.json({ data });
  }),
);

forumRouter.get(
  '/posts',
  validateQuery(listForumPostsSchema),
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
    const data = await forumService.listPosts(limit, offset, { category, tag });
    res.json({ data });
  }),
);

forumRouter.get(
  '/posts/me/drafts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.listMyPosts(user.id, 'draft');
    res.json({ data });
  }),
);

forumRouter.get(
  '/posts/me/scheduled',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.listMyPosts(user.id, 'scheduled');
    res.json({ data });
  }),
);

forumRouter.get(
  '/posts/:slug',
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromRequest(req);
    const data = await forumService.getPostBySlug(String(req.params.slug), viewerId);
    res.json({ data });
  }),
);

forumRouter.post(
  '/posts',
  requireAuth,
  validateBody(createForumPostSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.createPost(user.id, req.body);
    res.status(201).json({ data });
  }),
);

forumRouter.patch(
  '/posts/:id',
  requireAuth,
  validateBody(updateForumPostSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.updatePost(user.id, String(req.params.id), req.body);
    res.json({ data });
  }),
);

forumRouter.delete(
  '/posts/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.deletePost(user.id, String(req.params.id));
    res.json({ data });
  }),
);

forumRouter.post(
  '/posts/:id/publish',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.publishPost(user.id, String(req.params.id));
    res.json({ data });
  }),
);

forumRouter.post(
  '/posts/:id/view',
  asyncHandler(async (req, res) => {
    const viewerId = getViewerIdFromRequest(req);
    const data = await forumService.recordView(String(req.params.id), {
      userId: viewerId ?? undefined,
      clientIp: getClientIp(req),
    });
    res.json({ data });
  }),
);

forumRouter.get(
  '/posts/:id/comments',
  asyncHandler(async (req, res) => {
    const data = await forumService.listComments(String(req.params.id));
    res.json({ data });
  }),
);

forumRouter.post(
  '/posts/:id/comments',
  requireAuth,
  validateBody(createForumCommentSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.createComment(
      user.id,
      String(req.params.id),
      req.body.body,
      req.body.parentId,
    );
    res.status(201).json({ data });
  }),
);

forumRouter.patch(
  '/comments/:id',
  requireAuth,
  validateBody(updateForumCommentSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.updateComment(user.id, String(req.params.id), req.body.body);
    res.json({ data });
  }),
);

forumRouter.delete(
  '/comments/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.deleteComment(user.id, String(req.params.id));
    res.json({ data });
  }),
);

forumRouter.post(
  '/posts/:id/poll/vote',
  requireAuth,
  validateBody(voteForumPollSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const data = await forumService.votePoll(user.id, String(req.params.id), req.body.optionId);
    res.json({ data });
  }),
);
