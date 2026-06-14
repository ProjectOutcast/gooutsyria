-- Add Event.cityId. Existing events are backfilled to Damascus before the
-- NOT NULL constraint so the migration is safe on a populated table.
ALTER TABLE "Event" ADD COLUMN "cityId" TEXT;

UPDATE "Event"
SET "cityId" = (SELECT "id" FROM "City" WHERE "slug" = 'damascus' LIMIT 1)
WHERE "cityId" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "cityId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Event_cityId_idx" ON "Event"("cityId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
