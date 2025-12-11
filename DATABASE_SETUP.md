# Configuración de Base de Datos - TrackTeam

## Estado Actual

Se ha configurado Prisma ORM con PostgreSQL para el proyecto TrackTeam. El schema incluye tres modelos principales:

- **Colaborador**: Gestión de usuarios/colaboradores del sistema
- **Equipo**: Inventario de equipos (desktops y laptops)
- **ServicioTecnico**: Registro de mantenimientos y servicios

## Opciones para Configurar la Base de Datos

### Opción 1: Base de Datos Local con Docker (Recomendado para Desarrollo)

```bash
# Crear y ejecutar contenedor PostgreSQL
docker run --name trackteam-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=trackteam -p 5432:5432 -d postgres:16

# Verificar que está corriendo
docker ps
```

Luego actualizar `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trackteam?schema=public"
```

### Opción 2: PostgreSQL Instalado Localmente

Si ya tienes PostgreSQL instalado en tu máquina:

1. Crear la base de datos:
   ```sql
   CREATE DATABASE trackteam;
   ```

2. Actualizar `.env` con tus credenciales:
   ```env
   DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/trackteam?schema=public"
   ```

### Opción 3: Base de Datos en la Nube (Supabase - Recomendado para Producción)

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. En Settings > Database, copiar la Connection String (Session mode)
4. Actualizar `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

### Opción 4: Prisma Postgres (Rápido para Pruebas)

```bash
# Crear base de datos PostgreSQL gratuita en la nube de Prisma
npx create-db
```

Esto te dará automáticamente una DATABASE_URL configurada.

## Pasos Siguientes (Después de Configurar DATABASE_URL)

### 1. Generar Prisma Client

```bash
npx prisma generate
```

Esto creará el cliente de Prisma en `lib/generated/prisma/client`.

### 2. Crear la Migración Inicial

```bash
npx prisma migrate dev --name init
```

Esto:
- Creará las tablas en PostgreSQL
- Generará el archivo de migración en `prisma/migrations/`
- Sincronizará el schema con la base de datos

### 3. (Opcional) Poblar con Datos de Prueba

Crear archivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear colaboradores de prueba
  const colaborador1 = await prisma.colaborador.create({
    data: {
      nombre: "Juan",
      apellido: "Pérez",
      cargo: "Desarrollador Senior",
      email: "juan.perez@trackteam.com",
      departamento: "Tecnología",
      ciudad: "Bogotá",
    },
  });

  const colaborador2 = await prisma.colaborador.create({
    data: {
      nombre: "María",
      apellido: "García",
      cargo: "Diseñadora UX",
      email: "maria.garcia@trackteam.com",
      departamento: "Diseño",
      ciudad: "Medellín",
    },
  });

  // Crear equipos de prueba
  await prisma.equipo.create({
    data: {
      serial: "TT-2024-001",
      marca: "Dell",
      modelo: "Latitude 5420",
      tipo: "Portátil",
      procesador: "Intel Core i7-1185G7",
      ram: 16,
      almacenamiento: "512GB SSD NVMe",
      gpu: "Intel Iris Xe Graphics",
      estadoSalud: "Bueno",
      fechaAdquisicion: new Date("2024-01-15"),
      colaboradorId: colaborador1.id,
    },
  });

  await prisma.equipo.create({
    data: {
      serial: "TT-2024-002",
      marca: "HP",
      modelo: "ProDesk 600 G6",
      tipo: "Desktop",
      procesador: "Intel Core i5-10500",
      ram: 8,
      almacenamiento: "256GB SSD + 1TB HDD",
      gpu: "Intel UHD Graphics 630",
      estadoSalud: "Regular",
      fechaAdquisicion: new Date("2024-02-01"),
      colaboradorId: colaborador2.id,
    },
  });

  console.log("✅ Base de datos poblada con datos de prueba");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Agregar a `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Ejecutar seed:
```bash
npx prisma db seed
```

### 4. Abrir Prisma Studio (GUI para ver/editar datos)

```bash
npx prisma studio
```

Se abrirá en `http://localhost:5555`

## Verificación de la Configuración

Para verificar que todo funciona correctamente:

```bash
# 1. Generar cliente
npx prisma generate

# 2. Crear migración
npx prisma migrate dev --name init

# 3. Verificar conexión
npx prisma db execute --stdin <<< "SELECT NOW();"

# 4. Abrir Studio para verificar tablas
npx prisma studio
```

## Solución de Problemas

### Error: "Can't reach database server"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar puerto (por defecto 5432)

### Error: "Prisma Client has not been generated"
```bash
npx prisma generate
```

### Error en migraciones
```bash
# Resetear base de datos (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset
```

## Comandos Útiles de Prisma

```bash
# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Formatear schema.prisma
npx prisma format

# Verificar schema
npx prisma validate

# Generar diagrama ERD (Entity Relationship Diagram)
npx prisma generate --schema=./prisma/schema.prisma
```

## Próximos Pasos

Una vez configurada la base de datos:

1. ✅ Ejecutar el servidor de desarrollo: `npm run dev`
2. ✅ Navegar a `http://localhost:3000/colaboradores`
3. ✅ Probar crear, listar, editar y eliminar colaboradores
4. ⏳ Implementar Fase 1.2: Gestión de Equipos
5. ⏳ Implementar Fase 1.3: Registro de Mantenimientos

## Notas Importantes

- **Nunca** commitear el archivo `.env` con credenciales reales
- El archivo `.env` ya está en `.gitignore`
- Para producción, usar variables de entorno de tu plataforma de hosting
- Mantener backups regulares de la base de datos en producción
