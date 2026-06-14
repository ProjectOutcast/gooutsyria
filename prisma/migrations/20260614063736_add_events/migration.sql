-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "address" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "timeLabel" TEXT,
    "priceFrom" INTEGER,
    "priceNote" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'a',
    "imageUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredKicker" TEXT,
    "organizer" JSONB,
    "outlets" JSONB,
    "program" JSONB,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");
