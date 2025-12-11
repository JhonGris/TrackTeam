-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
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
    "fechaAdquisicion" DATETIME,
    "fechaGarantia" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "procesador" TEXT,
    "ram" INTEGER,
    "ramDetalle" TEXT,
    "almacenamientoTipo" TEXT,
    "almacenamientoGb" INTEGER,
    "discosDetalle" TEXT,
    "tarjetaVideo" TEXT,
    "gpuDetalle" TEXT,
    "usuarioId" TEXT,
    "departamento" TEXT,
    "ubicacion" TEXT,
    "pantallas" INTEGER NOT NULL DEFAULT 0,
    "resolucionPantalla" TEXT,
    "tieneTeclado" BOOLEAN NOT NULL DEFAULT false,
    "tieneMouse" BOOLEAN NOT NULL DEFAULT false,
    "otrosPeriferico" TEXT,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "equipos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "imagenes_equipos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "imagenes_equipos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "servicios_tecnicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipoId" TEXT NOT NULL,
    "tipoMantenimiento" TEXT NOT NULL,
    "fechaServicio" DATETIME NOT NULL,
    "tecnicoResponsable" TEXT NOT NULL,
    "diagnostico" TEXT,
    "descripcionTrabajo" TEXT,
    "costoReparacion" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "servicios_tecnicos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_serial_key" ON "equipos"("serial");
