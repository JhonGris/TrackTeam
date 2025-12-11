-- AlterTable
ALTER TABLE "servicios_tecnicos" ADD COLUMN "departamentoEnMomento" TEXT;
ALTER TABLE "servicios_tecnicos" ADD COLUMN "usuarioAsignado" TEXT;

-- CreateTable
CREATE TABLE "historial_asignaciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipoId" TEXT NOT NULL,
    "equipoSerial" TEXT NOT NULL,
    "usuarioId" TEXT,
    "usuarioNombre" TEXT NOT NULL,
    "departamento" TEXT,
    "ciudad" TEXT,
    "fechaInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" DATETIME,
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "creadoPor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "historial_asignaciones_equipoId_idx" ON "historial_asignaciones"("equipoId");

-- CreateIndex
CREATE INDEX "historial_asignaciones_usuarioId_idx" ON "historial_asignaciones"("usuarioId");
