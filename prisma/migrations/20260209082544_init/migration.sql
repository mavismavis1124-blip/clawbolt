-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "webhookUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "botId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "logs" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deployment_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
