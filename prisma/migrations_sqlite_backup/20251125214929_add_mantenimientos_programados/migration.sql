-- CreateTable
CREATE TABLE "mantenimientos_programados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaProgramada" DATETIME NOT NULL,
    "horaEstimada" TEXT,
    "duracionEstimada" INTEGER,
    "esRecurrente" BOOLEAN NOT NULL DEFAULT false,
    "frecuencia" TEXT,
    "diasIntervalo" INTEGER,
    "fechaFinRecurrencia" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "fechaCompletado" DATETIME,
    "equipoId" TEXT NOT NULL,
    "servicioTecnicoId" TEXT,
    "notificacion7dias" BOOLEAN NOT NULL DEFAULT false,
    "notificacion3dias" BOOLEAN NOT NULL DEFAULT false,
    "notificacion1dia" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "mantenimientos_programados_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mantenimientos_programados_servicioTecnicoId_fkey" FOREIGN KEY ("servicioTecnicoId") REFERENCES "servicios_tecnicos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "mantenimientos_programados_servicioTecnicoId_key" ON "mantenimientos_programados"("servicioTecnicoId");
