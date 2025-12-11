-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_equipos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serial" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "procesador" TEXT NOT NULL,
    "ram" INTEGER NOT NULL,
    "almacenamiento" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "ramDetalle" TEXT,
    "discosDetalle" TEXT,
    "gpuDetalle" TEXT,
    "almacenamientoTipo" TEXT,
    "almacenamientoGb" INTEGER,
    "tarjetaVideo" TEXT,
    "pantallas" INTEGER NOT NULL DEFAULT 0,
    "resolucionPantalla" TEXT,
    "tieneTeclado" BOOLEAN NOT NULL DEFAULT false,
    "tieneMouse" BOOLEAN NOT NULL DEFAULT false,
    "otrosPeriferico" TEXT,
    "estadoSalud" TEXT NOT NULL DEFAULT 'Bueno',
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "fechaAdquisicion" DATETIME NOT NULL,
    "fechaGarantia" DATETIME,
    "colaboradorId" TEXT,
    "departamento" TEXT,
    "ubicacion" TEXT,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "equipos_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_equipos" ("almacenamiento", "colaboradorId", "createdAt", "departamento", "discosDetalle", "estadoSalud", "fechaAdquisicion", "fechaGarantia", "gpu", "gpuDetalle", "id", "marca", "modelo", "observaciones", "otrosPeriferico", "pantallas", "procesador", "ram", "ramDetalle", "resolucionPantalla", "serial", "tieneMouse", "tieneTeclado", "tipo", "ubicacion", "updatedAt") SELECT "almacenamiento", "colaboradorId", "createdAt", "departamento", "discosDetalle", "estadoSalud", "fechaAdquisicion", "fechaGarantia", "gpu", "gpuDetalle", "id", "marca", "modelo", "observaciones", "otrosPeriferico", "pantallas", "procesador", "ram", "ramDetalle", "resolucionPantalla", "serial", "tieneMouse", "tieneTeclado", "tipo", "ubicacion", "updatedAt" FROM "equipos";
DROP TABLE "equipos";
ALTER TABLE "new_equipos" RENAME TO "equipos";
CREATE UNIQUE INDEX "equipos_serial_key" ON "equipos"("serial");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
