-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_ownerId_idx" ON "Event"("ownerId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
