-- CreateTable
CREATE TABLE "DraftPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "media" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DraftPost_authorId_idx" ON "DraftPost"("authorId");

-- CreateIndex
CREATE INDEX "DraftPost_authorId_updatedAt_idx" ON "DraftPost"("authorId", "updatedAt");

-- AddForeignKey
ALTER TABLE "DraftPost" ADD CONSTRAINT "DraftPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
