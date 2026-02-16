-- CreateTable
CREATE TABLE "DeploymentJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "botId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DEPLOY',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "payload" TEXT,
    "logs" TEXT,
    "error" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeploymentJob_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "model" TEXT NOT NULL DEFAULT 'gpt',
    "channel" TEXT NOT NULL DEFAULT 'telegram',
    "runtimeStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "containerName" TEXT,
    "containerId" TEXT,
    "runtimePort" INTEGER,
    "lastHeartbeatAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Bot" ("createdAt", "id", "name", "status", "token", "updatedAt", "userId", "username", "webhookUrl") SELECT "createdAt", "id", "name", "status", "token", "updatedAt", "userId", "username", "webhookUrl" FROM "Bot";
DROP TABLE "Bot";
ALTER TABLE "new_Bot" RENAME TO "Bot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
