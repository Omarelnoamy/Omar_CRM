-- CreateTable
CREATE TABLE "AIFollowupDraft" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "followup" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIFollowupDraft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIFollowupDraft" ADD CONSTRAINT "AIFollowupDraft_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFollowupDraft" ADD CONSTRAINT "AIFollowupDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
