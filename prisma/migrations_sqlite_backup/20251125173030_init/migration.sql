-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departamento" TEXT,
    "ciudad" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serial" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "procesador" TEXT NOT NULL,
    "ram" INTEGER NOT NULL,
    "almacenamiento" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "estadoSalud" TEXT NOT NULL DEFAULT 'Bueno',
    "fechaAdquisicion" DATETIME NOT NULL,
    "colaboradorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "equipos_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "servicios_tecnicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "fechaServicio" DATETIME NOT NULL,
    "problemas" TEXT NOT NULL,
    "soluciones" TEXT NOT NULL,
    "tiempoInvertido" INTEGER NOT NULL,
    "estadoResultante" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "servicios_tecnicos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_email_key" ON "colaboradores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_serial_key" ON "equipos"("serial");
