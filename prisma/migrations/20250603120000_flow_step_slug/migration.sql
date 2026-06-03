-- Replace fixed FlowStep enum with owner-defined slugs (drinks, food, other, etc.)

ALTER TABLE "MenuFlowStep" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "MenuFlowStep" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "MenuFlowStep" SET "slug" = LOWER("step"::text) WHERE "slug" IS NULL;

ALTER TABLE "MenuFlowStep" ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "MenuFlowStep" DROP CONSTRAINT IF EXISTS "MenuFlowStep_restaurantId_step_key";
ALTER TABLE "MenuFlowStep" DROP COLUMN IF EXISTS "step";

DROP TYPE IF EXISTS "FlowStep";

CREATE UNIQUE INDEX IF NOT EXISTS "MenuFlowStep_restaurantId_slug_key" ON "MenuFlowStep"("restaurantId", "slug");
