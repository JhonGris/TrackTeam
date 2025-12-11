/*
  Warnings:

  - You are about to drop the column `departamento` on the `colaboradores` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_colaboradores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ciudad" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_colaboradores" ("apellido", "cargo", "ciudad", "createdAt", "email", "id", "nombre", "updatedAt") SELECT "apellido", "cargo", "ciudad", "createdAt", "email", "id", "nombre", "updatedAt" FROM "colaboradores";
DROP TABLE "colaboradores";
ALTER TABLE "new_colaboradores" RENAME TO "colaboradores";
CREATE UNIQUE INDEX "colaboradores_email_key" ON "colaboradores"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
