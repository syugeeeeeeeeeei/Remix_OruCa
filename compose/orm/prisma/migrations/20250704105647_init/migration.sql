-- CreateTable
CREATE TABLE "TestItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestItem_pkey" PRIMARY KEY ("id")
);
