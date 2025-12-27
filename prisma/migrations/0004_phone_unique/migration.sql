-- Add unique constraint on phone
DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_phone_key" UNIQUE ("phone");
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;
