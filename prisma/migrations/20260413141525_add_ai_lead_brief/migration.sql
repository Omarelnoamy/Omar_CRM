-- CreateTable
CREATE TABLE "AILeadBrief" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "brief" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AILeadBrief_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AILeadBrief" ADD CONSTRAINT "AILeadBrief_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AILeadBrief" ADD CONSTRAINT "AILeadBrief_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
