-- CreateTable
CREATE TABLE "archivos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nombreAlmacenado" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanio" INTEGER NOT NULL,
    "ruta" TEXT NOT NULL,
    "tipoEntidad" TEXT NOT NULL,
    "equipoId" TEXT,
    "servicioTecnicoId" TEXT,
    "descripcion" TEXT,
    "esImagen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "archivos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archivos_servicioTecnicoId_fkey" FOREIGN KEY ("servicioTecnicoId") REFERENCES "servicios_tecnicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
