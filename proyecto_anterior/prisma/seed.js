const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuarios de prueba
  const usuarios = [
    {
      nombre: 'Juan Pérez',
      email: 'juan.perez@gist.com',
      departamento: 'Diseñador Gráfico',
      ciudad: 'Bogotá'
    },
    {
      nombre: 'María García',
      email: 'maria.garcia@gist.com',
      departamento: 'Copy',
      ciudad: 'Medellín'
    },
    {
      nombre: 'Carlos López',
      email: 'carlos.lopez@gist.com',
      departamento: 'Project Manager',
      ciudad: 'Cali'
    },
    {
      nombre: 'Ana Martínez',
      email: 'ana.martinez@gist.com',
      departamento: 'Desarrollador',
      ciudad: 'Barranquilla'
    },
    {
      nombre: 'Luis Rodríguez',
      email: 'luis.rodriguez@gist.com',
      departamento: 'Gerencia',
      ciudad: 'Cartagena'
    },
    {
      nombre: 'Sofia Hernández',
      email: 'sofia.hernandez@gist.com',
      departamento: 'KAM',
      ciudad: 'Bucaramanga'
    },
    {
      nombre: 'Diego Morales',
      email: 'diego.morales@gist.com',
      departamento: 'Motion Graphics',
      ciudad: 'Pereira'
    },
    {
      nombre: 'Camila Jiménez',
      email: 'camila.jimenez@gist.com',
      departamento: 'Administrativo',
      ciudad: 'Santa Marta'
    }
  ]

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {},
      create: usuario
    })
  }

  // Crear equipos de prueba
  const equipos = [
    {
      serial: 'LT-2024-001',
      marca: 'Dell',
      modelo: 'Latitude 5520',
      tipo: 'Laptop',
      procesador: 'Intel i7-11650H',
      ram: 16,
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 512,
      estado: 'Activo',
      ubicacion: 'Oficina Principal',
      tieneTeclado: true,
      tieneMouse: true,
      pantallas: 1
    },
    {
      serial: 'PC-2024-001',
      marca: 'HP',
      modelo: 'EliteDesk 800',
      tipo: 'Desktop',
      procesador: 'Intel i5-12400',
      ram: 8,
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 256,
      estado: 'Activo',
      ubicacion: 'Oficina Principal',
      tieneTeclado: true,
      tieneMouse: true,
      pantallas: 1
    },
    {
      serial: 'LT-2024-002',
      marca: 'Lenovo',
      modelo: 'ThinkPad X1',
      tipo: 'Laptop',
      procesador: 'Intel i7-12800H',
      ram: 32,
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 1000,
      estado: 'Activo',
      ubicacion: 'Oficina Principal',
      tieneTeclado: true,
      tieneMouse: true,
      pantallas: 1
    },
    {
      serial: 'MON-2024-001',
      marca: 'Samsung',
      modelo: 'Odyssey G7',
      tipo: 'Monitor',
      estado: 'Activo',
      ubicacion: 'Oficina Principal',
      pantallas: 1,
      resolucionPantalla: '2560x1440'
    },
    {
      serial: 'TAB-2024-001',
      marca: 'Apple',
      modelo: 'iPad Pro 11',
      tipo: 'Tablet',
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 256,
      estado: 'Activo',
      ubicacion: 'Oficina Principal'
    }
  ]

  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { serial: equipo.serial },
      update: {},
      create: equipo
    })
  }

  // Crear algunos servicios técnicos de prueba
  const servicios = [
    {
      equipoId: 'LT-2024-001', // Necesitaremos obtener el ID real después de crear el equipo
      tipoMantenimiento: 'Preventivo',
      fechaServicio: new Date('2024-11-01'),
      tecnicoResponsable: 'Servicio Técnico GIST',
      diagnostico: 'Mantenimiento general programado',
      descripcionTrabajo: 'Limpieza general y actualización de software'
    },
    {
      equipoId: 'PC-2024-001',
      tipoMantenimiento: 'Correctivo',
      fechaServicio: new Date('2024-11-10'),
      tecnicoResponsable: 'Servicio Técnico GIST',
      diagnostico: 'Memoria RAM defectuosa',
      descripcionTrabajo: 'Reemplazo de memoria RAM',
      costoReparacion: 150.00
    }
  ]

  console.log('✅ Seed completado exitosamente!')
  console.log(`📊 Creados: ${usuarios.length} usuarios, ${equipos.length} equipos`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })