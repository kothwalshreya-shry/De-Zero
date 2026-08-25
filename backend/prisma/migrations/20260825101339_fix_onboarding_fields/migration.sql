/*
  Warnings:

  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `learningStyle` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentLevel" TEXT,
    "interests" TEXT,
    "goal" TEXT,
    "weeklyTime" TEXT,
    "struggle" TEXT
);
INSERT INTO "new_User" ("createdAt", "currentLevel", "email", "goal", "id", "name", "passwordHash", "weeklyTime") SELECT "createdAt", "currentLevel", "email", "goal", "id", "name", "passwordHash", "weeklyTime" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
