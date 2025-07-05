/*
  Warnings:

  - You are about to drop the `TestItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TestItem";

-- CreateTable
CREATE TABLE "User" (
    "student_ID" VARCHAR(16) NOT NULL,
    "student_Name" VARCHAR(64),
    "student_token" VARCHAR(64) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("student_ID")
);

-- CreateTable
CREATE TABLE "Log" (
    "student_ID" VARCHAR(16) NOT NULL,
    "isInRoom" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("student_ID")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_student_ID_fkey" FOREIGN KEY ("student_ID") REFERENCES "User"("student_ID") ON DELETE CASCADE ON UPDATE CASCADE;
