# GIST - Sistema de Gestión de Inventario y Servicios Técnicos

Un sistema moderno y completo para la gestión de inventario de equipos informáticos y trazabilidad de servicios técnicos.

## 🌟 Características Principales

### ✅ MVP Completado
- **Dashboard Intuitivo**: Resumen ejecutivo con estadísticas en tiempo real
- **Gestión de Equipos**: Listado completo con filtros y búsqueda avanzada
- **Gestión de Usuarios**: Control de usuarios y asignaciones de equipos
- **Servicios Técnicos**: Historial completo de mantenimientos y reparaciones
- **Reportes y Auditoría**: Generación de documentos y análisis consolidados
- **Diseño Responsive**: Funciona perfectamente en desktop, tablet y móvil

### 🚀 Próximas Implementaciones
- CRUD completo para equipos y usuarios
- Sistema de upload de fotografías
- Generación de PDFs personalizados
- Códigos QR para equipos
- API REST completa
- Autenticación y roles de usuario

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Base de Datos**: Prisma ORM + SQLite (desarrollo) / PostgreSQL (producción)
- **UI Framework**: Tailwind CSS + Shadcn/UI
- **Iconografía**: Lucide React
- **Deployment**: Vercel (recomendado)

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Crear/actualizar base de datos
npx prisma db push
```

### 3. Ejecutar en Desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

El sistema estará disponible en: `http://localhost:3000`

## 📱 Funcionalidades por Módulo

### 🏠 Dashboard
- Estadísticas generales del inventario
- Alertas de mantenimiento preventivo
- Equipos registrados recientemente
- Resumen de servicios técnicos

### 💻 Gestión de Equipos
- Listado completo con filtros avanzados
- Información detallada de especificaciones
- Estados: Activo, En Reparación, Descontinuado
- Asignaciones por usuario y departamento
- Búsqueda por serial, marca, modelo

### 👥 Gestión de Usuarios
- Directorio completo de usuarios
- Información de contacto
- Equipos asignados por usuario
- Filtros por departamento
- Estadísticas de asignaciones

### 🔧 Servicios Técnicos
- Historial completo de intervenciones
- Tipos: Preventivo, Correctivo, Instalación/Upgrade
- Trazabilidad por técnico responsable
- Control de costos y tiempos
- Estados de seguimiento

### 📊 Reportes y Auditoría
- Resumen ejecutivo con KPIs
- Reportes predefinidos (PDF/Excel)
- Generación de reportes personalizados
- Filtros por fecha, departamento, estado
- Análisis de costos y tendencias

## 📖 Próximos Pasos de Desarrollo

1. **Implementar CRUD completo**
   - Formularios para crear/editar equipos
   - Gestión de usuarios con validaciones
   - API routes para operaciones de base de datos

2. **Sistema de archivos**
   - Integración con Cloudinary
   - Upload de fotografías con drag & drop
   - Generación de códigos QR

3. **Generación de PDFs**
   - Fichas técnicas individuales
   - Reportes consolidados
   - Personalización de plantillas

4. **Autenticación**
   - NextAuth.js con múltiples providers
   - Roles y permisos por módulo
   - Auditoría de cambios

## 📞 Soporte

Para más información sobre Next.js, consulta:
- [Next.js Documentation](https://nextjs.org/docs) - características y API de Next.js
- [Learn Next.js](https://nextjs.org/learn) - tutorial interactivo de Next.js

**Desarrollado con ❤️ para optimizar la gestión de inventarios tecnológicos**
