CREATE TABLE "ProjectLocationVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "userId" TEXT,
    "operation" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "label" TEXT,
    "name" TEXT,
    "description" TEXT,
    "polygon" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectLocationVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectLocationVersion_projectId_idx" ON "ProjectLocationVersion"("projectId");
CREATE INDEX "ProjectLocationVersion_locationId_idx" ON "ProjectLocationVersion"("locationId");

ALTER TABLE "ProjectLocationVersion" ADD CONSTRAINT "ProjectLocationVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectLocationVersion" ADD CONSTRAINT "ProjectLocationVersion_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ProjectLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectLocationVersion" ADD CONSTRAINT "ProjectLocationVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
