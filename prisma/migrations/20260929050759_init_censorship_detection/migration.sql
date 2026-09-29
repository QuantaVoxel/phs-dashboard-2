-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('DNS', 'IP', 'SNI', 'HTTP');

-- CreateEnum
CREATE TYPE "BlockSignatureType" AS ENUM ('IP', 'HOSTNAME', 'KEYWORD');

-- AlterTable
ALTER TABLE "website_check_logs" ADD COLUMN     "blockType" "BlockType";

-- AlterTable
ALTER TABLE "websites" ADD COLUMN     "blockType" "BlockType";

-- CreateTable
CREATE TABLE "probes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isp" TEXT NOT NULL,
    "location" TEXT,
    "tokenHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "probes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_signatures" (
    "id" TEXT NOT NULL,
    "type" "BlockSignatureType" NOT NULL,
    "value" TEXT NOT NULL,
    "isp" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "block_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "probe_check_results" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "probeId" TEXT,
    "status" "WebsiteStatus" NOT NULL,
    "blockType" "BlockType",
    "stage" TEXT,
    "resolvedIps" TEXT,
    "httpStatus" INTEGER,
    "redirectChain" TEXT,
    "errorCode" TEXT,
    "latencyMs" INTEGER,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "probe_check_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "probe_check_results_websiteId_checkedAt_idx" ON "probe_check_results"("websiteId", "checkedAt");

-- CreateIndex
CREATE INDEX "probe_check_results_probeId_idx" ON "probe_check_results"("probeId");

-- AddForeignKey
ALTER TABLE "probe_check_results" ADD CONSTRAINT "probe_check_results_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "probe_check_results" ADD CONSTRAINT "probe_check_results_probeId_fkey" FOREIGN KEY ("probeId") REFERENCES "probes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
