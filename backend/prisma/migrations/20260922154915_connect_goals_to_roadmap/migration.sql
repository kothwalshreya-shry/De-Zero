-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "milestone" INTEGER NOT NULL DEFAULT 1,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 50,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    CONSTRAINT "DailyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyGoal" ("category", "completed", "completedAt", "date", "description", "id", "title", "userId", "xp") SELECT "category", "completed", "completedAt", "date", "description", "id", "title", "userId", "xp" FROM "DailyGoal";
DROP TABLE "DailyGoal";
ALTER TABLE "new_DailyGoal" RENAME TO "DailyGoal";
CREATE INDEX "DailyGoal_userId_date_idx" ON "DailyGoal"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
