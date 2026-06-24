-- AlterTable ForumPost
ALTER TABLE "ForumPost" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'published';
ALTER TABLE "ForumPost" ADD COLUMN "scheduledAt" TIMESTAMP(3);
ALTER TABLE "ForumPost" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "ForumPost" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "ForumPost" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ForumPost" ADD COLUMN "commentCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "ForumPost_authorId_status_idx" ON "ForumPost"("authorId", "status");
CREATE INDEX "ForumPost_status_scheduledAt_idx" ON "ForumPost"("status", "scheduledAt");
CREATE INDEX "ForumPost_categoryId_idx" ON "ForumPost"("categoryId");

-- CreateTable ForumCategory
CREATE TABLE "ForumCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumCategory_slug_key" ON "ForumCategory"("slug");

INSERT INTO "ForumCategory" ("id", "name", "slug", "description", "sortOrder") VALUES
  ('cat-general', 'General', 'general', 'Open discussion about the arena', 1),
  ('cat-tips', 'Tips & Picks', 'tips-picks', 'Share predictions and betting picks', 2),
  ('cat-strategy', 'Strategy', 'strategy', 'Bankroll, markets, and long-term approach', 3),
  ('cat-news', 'News', 'news', 'Sports news and match discussion', 4);

-- CreateTable ForumComment
CREATE TABLE "ForumComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ForumComment_postId_createdAt_idx" ON "ForumComment"("postId", "createdAt");
CREATE INDEX "ForumComment_authorId_idx" ON "ForumComment"("authorId");
CREATE INDEX "ForumComment_parentId_idx" ON "ForumComment"("parentId");

-- CreateTable ForumAttachment
CREATE TABLE "ForumAttachment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ForumAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ForumAttachment_postId_idx" ON "ForumAttachment"("postId");

-- CreateTable ForumPoll
CREATE TABLE "ForumPoll" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumPoll_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumPoll_postId_key" ON "ForumPoll"("postId");

-- CreateTable ForumPollOption
CREATE TABLE "ForumPollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ForumPollOption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ForumPollOption_pollId_idx" ON "ForumPollOption"("pollId");

-- CreateTable ForumPollVote
CREATE TABLE "ForumPollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumPollVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumPollVote_pollId_userId_key" ON "ForumPollVote"("pollId", "userId");
CREATE INDEX "ForumPollVote_optionId_idx" ON "ForumPollVote"("optionId");

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ForumComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumAttachment" ADD CONSTRAINT "ForumAttachment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPoll" ADD CONSTRAINT "ForumPoll_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPollOption" ADD CONSTRAINT "ForumPollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ForumPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPollVote" ADD CONSTRAINT "ForumPollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ForumPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPollVote" ADD CONSTRAINT "ForumPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ForumPollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPollVote" ADD CONSTRAINT "ForumPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
