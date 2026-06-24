-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPostView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumViewReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumViewReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForumPost_slug_key" ON "ForumPost"("slug");

-- CreateIndex
CREATE INDEX "ForumPost_authorId_publishedAt_idx" ON "ForumPost"("authorId", "publishedAt");

-- CreateIndex
CREATE INDEX "ForumPost_publishedAt_idx" ON "ForumPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ForumPostView_postId_viewerKey_key" ON "ForumPostView"("postId", "viewerKey");

-- CreateIndex
CREATE INDEX "ForumPostView_postId_idx" ON "ForumPostView"("postId");

-- CreateIndex
CREATE INDEX "ForumPostView_userId_idx" ON "ForumPostView"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumViewReward_userId_milestone_key" ON "ForumViewReward"("userId", "milestone");

-- CreateIndex
CREATE INDEX "ForumViewReward_userId_idx" ON "ForumViewReward"("userId");

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPostView" ADD CONSTRAINT "ForumPostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPostView" ADD CONSTRAINT "ForumPostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumViewReward" ADD CONSTRAINT "ForumViewReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
