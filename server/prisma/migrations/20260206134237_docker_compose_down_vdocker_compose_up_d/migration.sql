-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'HUNTER');

-- CreateEnum
CREATE TYPE "DragonState" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'AT_RISK', 'CLOSED');

-- CreateEnum
CREATE TYPE "EncounterType" AS ENUM ('NEGOTIATION', 'COMBAT', 'BRIBE', 'OBSERVATION');

-- CreateEnum
CREATE TYPE "EncounterOutcome" AS ENUM ('SUCCESS', 'NEUTRAL', 'FAIL');

-- CreateEnum
CREATE TYPE "DragonOutcome" AS ENUM ('DOMESTICATED', 'ONE_TIME_DEAL', 'ELIMINATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'HUNTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dragon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speciesType" TEXT NOT NULL,
    "aggression" INTEGER NOT NULL DEFAULT 30,
    "state" "DragonState" NOT NULL DEFAULT 'ASSIGNED',
    "ownerHunterId" TEXT,
    "closedAt" TIMESTAMP(3),
    "outcome" "DragonOutcome",
    "outcomeNotes" TEXT,
    "lastEncounterAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dragon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "dragonId" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "type" "EncounterType" NOT NULL,
    "outcome" "EncounterOutcome" NOT NULL DEFAULT 'NEUTRAL',
    "notes" TEXT,
    "aggressionDelta" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Dragon_ownerHunterId_idx" ON "Dragon"("ownerHunterId");

-- CreateIndex
CREATE INDEX "Dragon_state_idx" ON "Dragon"("state");

-- CreateIndex
CREATE INDEX "Encounter_dragonId_createdAt_idx" ON "Encounter"("dragonId", "createdAt");

-- AddForeignKey
ALTER TABLE "Dragon" ADD CONSTRAINT "Dragon_ownerHunterId_fkey" FOREIGN KEY ("ownerHunterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_dragonId_fkey" FOREIGN KEY ("dragonId") REFERENCES "Dragon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
