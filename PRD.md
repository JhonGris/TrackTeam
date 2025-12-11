# Product Requirements Document (PRD)
# TrackTeam - Sistema de Gestión de Servicio Técnico

**Versión:** 1.0  
**Fecha:** 25 de noviembre de 2025  
**Autor:** Técnico de Soporte  
**Estado:** Borrador inicial

---

## 1. Resumen Ejecutivo

### 1.1 Descripción del Producto
TrackTeam es una aplicación web en la nube diseñada para gestionar el servicio técnico de equipos de cómputo (desktops y portátiles) de los colaboradores de la empresa. Permite llevar un seguimiento detallado de cada equipo, incluyendo su historial de mantenimientos, estado de salud y programación de revisiones preventivas.

### 1.2 Objetivo
Centralizar la información técnica de los equipos, facilitar el seguimiento de mantenimientos y optimizar la gestión del servicio técnico mediante un sistema organizado de registro y alertas.

### 1.3 Alcance
- Gestión de 40-50 equipos de cómputo
- Usuario único (técnico)
- Aplicación web accesible desde la nube
- Sin acceso offline

---

## 2. Usuarios y Roles

### 2.1 Perfil de Usuario

**Técnico de Soporte (Usuario Principal)**
- **Descripción:** Único usuario del sistema, responsable del mantenimiento técnico de todos los equipos
- **Permisos:** Acceso completo a todas las funcionalidades
- **Necesidades:**
  - Registrar y actualizar información de equipos
  - Programar y documentar mantenimientos
  - Generar reportes y exportar datos
  - Recibir alertas de mantenimientos programados

---

## 3. Funcionalidades Principales

### 3.1 Gestión de Equipos

#### 3.1.1 Registro de Equipos
**Descripción:** Sistema para registrar y mantener actualizada la información de cada equipo.

**Datos del Equipo:**
- Tipo de equipo (Desktop / Portátil)
- Marca
- Modelo
- Número de serie
- Especificaciones técnicas:
  - Procesador (CPU)
  - Memoria RAM
  - Almacenamiento
  - Tarjeta gráfica (GPU)
- Estado de salud (Bueno / Regular / Malo)
- Fecha de adquisición
- Fecha de última revisión

**Datos del Colaborador Asignado:**
- Nombre
- Apellido
- Cargo
- Correo electrónico

**Funcionalidades:**
- Crear nuevo equipo
- Editar información del equipo
- Ver hoja de vida completa del equipo
- Adjuntar archivos (fotos, facturas, certificados, documentos)
- Eliminar equipo (con confirmación)

#### 3.1.2 Estado de Salud
**Descripción:** Clasificación visual del estado general de cada equipo.

**Estados:**
- 🟢 **Bueno:** Equipo funcionando óptimamente
- 🟡 **Regular:** Equipo con problemas menores o requiere atención
- 🔴 **Malo:** Equipo con problemas graves o fuera de servicio

**Criterios de Evaluación:**
- Definidos por el técnico según:
  - Rendimiento general
  - Problemas recurrentes
  - Antigüedad
  - Resultados de última revisión

### 3.2 Gestión de Mantenimientos

#### 3.2.1 Tipos de Mantenimiento
- **Preventivo:** Mantenimiento programado periódico
- **Correctivo:** Reparación de fallos o problemas
- **Limpieza:** Limpieza física del equipo
- **Actualización de Software:** Instalación de actualizaciones, parches, nuevo software

#### 3.2.2 Registro de Mantenimiento
**Información a Capturar:**
- Fecha y hora del mantenimiento
- Tipo de mantenimiento
- Problemas encontrados (descripción detallada)
- Soluciones aplicadas (descripción detallada)
- Tiempo invertido (en horas/minutos)
- Estado de salud resultante
- Observaciones adicionales
- Archivos adjuntos (fotos, reportes)

#### 3.2.3 Mantenimientos Programados
**Descripción:** Sistema de programación de mantenimientos futuros.

**Funcionalidades:**
- Programar mantenimiento para fecha específica
- Configurar mantenimientos recurrentes (opcional):
  - Mensual
  - Trimestral
  - Semestral
  - Anual
  - Personalizado
- Asignar tipo de mantenimiento
- Agregar notas/instrucciones
- Ver calendario de mantenimientos programados

#### 3.2.4 Sistema de Alertas
**Descripción:** Notificaciones automáticas para recordar mantenimientos programados.

**Características:**
- Alertas por email
- Recordatorios previos (configurables):
  - 1 día antes
  - 3 días antes
  - 1 semana antes
- Vista de mantenimientos próximos en dashboard
- Indicadores visuales de mantenimientos vencidos

### 3.3 Gestión de Inventario de Repuestos

#### 3.3.1 Control de Repuestos y Accesorios
**Descripción:** Sistema para llevar inventario de componentes y accesorios disponibles.

**Información del Repuesto:**
- Nombre/Descripción
- Categoría (RAM, Disco Duro, Teclado, Mouse, Cable, etc.)
- Cantidad disponible
- Cantidad mínima (para alertas de stock bajo)
- Ubicación física
- Notas

**Funcionalidades:**
- Agregar/editar repuestos
- Registrar uso de repuestos en mantenimientos
- Alertas de stock bajo
- Historial de movimientos

### 3.4 Búsqueda y Filtros

**Capacidades de Búsqueda:**
- Por colaborador (nombre, apellido, correo)
- Por tipo de equipo (Desktop / Portátil)
- Por marca o modelo
- Por número de serie
- Por estado de salud
- Por fecha de última revisión
- Por mantenimientos próximos
- Por cargo del colaborador

**Filtros Combinados:**
- Múltiples criterios simultáneos
- Ordenamiento por diferentes campos

### 3.5 Reportes y Exportación

#### 3.5.1 Tipos de Reportes
1. **Hoja de Vida de Equipo**
   - Información completa del equipo
   - Historial completo de mantenimientos
   - Archivos adjuntos
   - Exportable a PDF

2. **Reporte por Colaborador**
   - Equipos asignados a un colaborador específico
   - Estado general de sus equipos
   - Historial de mantenimientos

3. **Reporte General de Equipos**
   - Lista completa de equipos
   - Estado de salud de cada uno
   - Última fecha de revisión
   - Mantenimientos próximos

4. **Estadísticas Generales**
   - Total de equipos por tipo
   - Distribución por estado de salud
   - Mantenimientos realizados (por tipo y período)
   - Tiempo total invertido en mantenimientos
   - Equipos que requieren atención

5. **Reporte de Inventario**
   - Estado actual de repuestos
   - Repuestos con stock bajo
   - Historial de uso

#### 3.5.2 Formatos de Exportación
- **PDF:** Para reportes y hojas de vida
- **Excel/CSV:** Para datos tabulares y análisis

### 3.6 Gestión de Archivos Adjuntos

**Tipos de Archivos Soportados:**
- Imágenes (JPG, PNG, WEBP)
- Documentos (PDF, DOC, DOCX)
- Hojas de cálculo (XLS, XLSX)
- Facturas y certificados

**Usos:**
- Fotos del equipo
- Facturas de compra
- Certificados de garantía
- Capturas de pantalla de errores
- Reportes técnicos
- Manuales de usuario

---

## 4. Interfaz de Usuario

### 4.1 Estructura de Navegación

**Dashboard Principal:**
- Resumen de equipos por estado de salud
- Mantenimientos próximos (calendario/lista)
- Alertas activas
- Estadísticas rápidas
- Acceso rápido a funciones principales

**Módulos Principales:**
1. **Equipos**
   - Lista de equipos
   - Vista detallada
   - Agregar/Editar equipo

2. **Mantenimientos**
   - Registrar mantenimiento
   - Historial de mantenimientos
   - Mantenimientos programados
   - Calendario

3. **Colaboradores**
   - Lista de colaboradores
   - Equipos asignados por colaborador

4. **Inventario**
   - Repuestos disponibles
   - Registrar movimiento
   - Alertas de stock

5. **Reportes**
   - Selector de tipo de reporte
   - Generador de reportes
   - Exportación

### 4.2 Diseño Visual

**Principios de Diseño:**
- Interfaz limpia y profesional
- Navegación intuitiva
- Acceso rápido a funciones frecuentes
- Indicadores visuales claros (colores para estados)
- Responsive design (adaptable a diferentes tamaños de pantalla)

**Paleta de Colores:**
- 🟢 Verde: Estado bueno, acciones positivas
- 🟡 Amarillo/Naranja: Estado regular, advertencias
- 🔴 Rojo: Estado malo, alertas críticas
- 🔵 Azul: Acciones principales, información
- ⚪ Neutral: Información general

---

## 5. Requisitos Técnicos

### 5.1 Arquitectura
- **Tipo:** Aplicación web
- **Despliegue:** En la nube
- **Acceso:** A través de navegador web
- **Acceso offline:** No requerido

### 5.2 Requisitos de Rendimiento
- Soporte para 40-50 equipos sin degradación de rendimiento
- Carga rápida de páginas (< 2 segundos)
- Búsquedas instantáneas
- Almacenamiento de archivos adjuntos

### 5.3 Seguridad
- Autenticación de usuario (login seguro)
- Sesiones seguras
- Backup automático de datos
- Protección de datos sensibles

### 5.4 Compatibilidad
- Navegadores modernos (Chrome, Firefox, Edge, Safari)
- Responsive (desktop, tablet)

---

## 6. Requisitos No Funcionales

### 6.1 Usabilidad
- Interfaz intuitiva que no requiera capacitación extensa
- Flujos de trabajo optimizados para tareas frecuentes
- Mensajes de error claros y útiles

### 6.2 Confiabilidad
- Disponibilidad del 99.9%
- Backup diario automático
- Recuperación de datos en caso de fallo

### 6.3 Mantenibilidad
- Código bien documentado
- Actualizaciones sin interrupción del servicio
- Logs de actividad para debugging

### 6.4 Escalabilidad
- Capacidad de crecer a 100+ equipos sin cambios significativos
- Posibilidad de agregar más usuarios en el futuro

---

## 7. Casos de Uso Principales

### 7.1 Registrar Nuevo Equipo
**Actor:** Técnico  
**Flujo:**
1. Técnico accede a "Agregar Equipo"
2. Completa información del equipo y colaborador
3. Sube archivos adjuntos (opcional)
4. Guarda el equipo
5. Sistema confirma registro exitoso

### 7.2 Realizar Mantenimiento
**Actor:** Técnico  
**Flujo:**
1. Técnico busca el equipo
2. Accede a "Registrar Mantenimiento"
3. Completa detalles del mantenimiento
4. Actualiza estado de salud del equipo
5. Adjunta archivos si es necesario
6. Guarda el registro
7. Sistema actualiza historial del equipo

### 7.3 Programar Mantenimiento Preventivo
**Actor:** Técnico  
**Flujo:**
1. Técnico accede a "Mantenimientos Programados"
2. Selecciona equipo
3. Define fecha y tipo de mantenimiento
4. Configura recordatorio
5. Guarda programación
6. Sistema envía alertas según configuración

### 7.4 Generar Reporte de Equipo
**Actor:** Técnico  
**Flujo:**
1. Técnico accede a vista de equipo
2. Selecciona "Generar Reporte"
3. Sistema genera PDF con hoja de vida completa
4. Técnico descarga o imprime reporte

### 7.5 Consultar Equipos que Requieren Atención
**Actor:** Técnico  
**Flujo:**
1. Técnico accede a Dashboard
2. Revisa sección de alertas y mantenimientos próximos
3. Filtra equipos por estado "Malo" o "Regular"
4. Visualiza lista de equipos que requieren atención
5. Accede a detalles de cada equipo

---

## 8. Flujos de Trabajo Típicos

### 8.1 Rutina Diaria
1. Login al sistema
2. Revisar dashboard de alertas
3. Ver mantenimientos programados para hoy/esta semana
4. Realizar mantenimientos pendientes
5. Actualizar registros

### 8.2 Mantenimiento Preventivo Mensual
1. Revisar calendario de mantenimientos
2. Preparar repuestos necesarios
3. Ejecutar mantenimientos programados
4. Documentar cada mantenimiento
5. Actualizar estado de equipos
6. Programar próximos mantenimientos

### 8.3 Atención de Problema Reportado
1. Identificar equipo del colaborador
2. Revisar historial del equipo
3. Diagnosticar problema
4. Registrar mantenimiento correctivo
5. Documentar solución aplicada
6. Actualizar estado de salud
7. Verificar si requiere seguimiento

---

## 9. Roadmap y Prioridades

### 9.1 Fase 1 - MVP (Funcionalidades Básicas)
**Prioridad: Alta**
- Gestión básica de equipos (CRUD)
- Registro de colaboradores
- Registro de mantenimientos
- Estados de salud
- Búsqueda básica

### 9.2 Fase 2 - Funcionalidades Intermedias
**Prioridad: Alta**
- Mantenimientos programados
- Sistema de alertas por email
- Archivos adjuntos
- Reportes básicos (hoja de vida)
- Dashboard con estadísticas

### 9.3 Fase 3 - Funcionalidades Avanzadas
**Prioridad: Media**
- Gestión de inventario de repuestos
- Reportes avanzados y estadísticas
- Exportación a PDF y Excel
- Calendario visual de mantenimientos
- Filtros y búsquedas avanzadas

### 9.4 Fase 4 - Mejoras y Optimización
**Prioridad: Baja**
- Mejoras de UI/UX basadas en uso
- Gráficas y visualizaciones
- Notificaciones in-app
- Plantillas de mantenimiento
- Historial de cambios/auditoría

---

## 10. Métricas de Éxito

### 10.1 KPIs del Sistema
- Reducción de tiempo en gestión administrativa
- Porcentaje de mantenimientos completados a tiempo
- Mejora en el estado general de equipos
- Reducción de fallos críticos por mantenimiento preventivo

### 10.2 Indicadores de Usabilidad
- Tiempo promedio para registrar un mantenimiento
- Tiempo promedio para generar un reporte
- Satisfacción del técnico con la herramienta

---

## 11. Riesgos y Mitigación

### 11.1 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos | Baja | Alto | Backups automáticos diarios, almacenamiento en la nube |
| Falla del servicio en la nube | Baja | Alto | Seleccionar proveedor confiable (AWS, Azure, GCP) |
| Complejidad excesiva de la UI | Media | Medio | Diseño iterativo, pruebas de usabilidad |
| No adaptarse a flujo de trabajo real | Media | Alto | Validación temprana con el técnico, iteraciones rápidas |

---

## 12. Supuestos y Dependencias

### 12.1 Supuestos
- El técnico tiene acceso constante a internet
- Los colaboradores no necesitan acceso directo al sistema
- No se requiere integración con otros sistemas existentes
- El número de equipos se mantendrá entre 40-50 en el corto plazo

### 12.2 Dependencias
- Servicio de hosting en la nube
- Servicio de email para notificaciones
- Almacenamiento para archivos adjuntos

---

## 13. Glosario

- **Equipo:** Dispositivo de cómputo (desktop o portátil) asignado a un colaborador
- **Mantenimiento Preventivo:** Revisión programada para prevenir problemas
- **Mantenimiento Correctivo:** Reparación de un problema existente
- **Hoja de Vida:** Historial completo de un equipo (información, mantenimientos, archivos)
- **Estado de Salud:** Clasificación del estado general de funcionamiento de un equipo
- **Colaborador:** Empleado de la empresa al que se le asigna un equipo

---

## 14. Apéndices

### 14.1 Ejemplos de Campos del Formulario

**Ejemplo de Registro de Equipo:**
```
Tipo: Portátil
Marca: Dell
Modelo: Latitude 5420
Serie: 12345ABC
CPU: Intel Core i5-1145G7
RAM: 16 GB DDR4
Almacenamiento: 512 GB SSD
GPU: Intel Iris Xe Graphics
Estado: Bueno

Colaborador:
Nombre: Juan
Apellido: Pérez
Cargo: Analista de Datos
Correo: juan.perez@empresa.com
```

**Ejemplo de Registro de Mantenimiento:**
```
Fecha: 25/11/2025
Tipo: Preventivo
Problemas Encontrados: 
- Disco al 85% de capacidad
- Actualizaciones de Windows pendientes
- Ventilador con acumulación de polvo

Soluciones Aplicadas:
- Limpieza de archivos temporales
- Instalación de actualizaciones de Windows
- Limpieza física del ventilador y componentes internos
- Actualización de drivers

Tiempo Invertido: 2 horas
Estado Resultante: Bueno
```

### 14.2 Wireframes (Descripciones)

**Dashboard:**
- Header con logo y usuario
- Tarjetas de resumen (Total equipos, Por estado, Mantenimientos próximos)
- Lista de alertas activas
- Calendario de mantenimientos
- Acceso rápido a funciones principales

**Vista de Equipo:**
- Información del equipo en la parte superior
- Tabs: Detalles, Historial de Mantenimientos, Archivos
- Botones de acción: Editar, Registrar Mantenimiento, Programar Mantenimiento
- Estado de salud destacado visualmente

---

## 15. Notas de Revisión

**Versión 1.0 - 25/11/2025**
- Creación inicial del PRD basada en requerimientos del técnico
- Definición completa de funcionalidades core
- Establecimiento de roadmap en 4 fases

---

**Próximos Pasos:**
1. Revisión y aprobación del PRD
2. Definición de stack tecnológico
3. Diseño de mockups y wireframes detallados
4. Planificación del sprint de desarrollo
5. Inicio del desarrollo del MVP (Fase 1)
