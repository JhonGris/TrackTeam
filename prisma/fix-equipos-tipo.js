// Script para corregir equipos sin campo 'tipo' válido
// Ejecutar con: node prisma/fix-equipos-tipo.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Buscar todos los equipos y filtrar los que no tienen tipo válido
  const todosLosEquipos = await prisma.equipo.findMany()
  
  const equiposSinTipo = todosLosEquipos.filter(e => 
    !e.tipo || e.tipo === '' || !['Desktop', 'Portátil'].includes(e.tipo)
  )

  console.log(`Encontrados ${equiposSinTipo.length} equipos sin tipo válido`)

  // Actualizar todos a 'Desktop' por defecto (son workstations según los nombres)
  for (const equipo of equiposSinTipo) {
    const tipo = equipo.modelo.toLowerCase().includes('tower') || 
                 equipo.modelo.toLowerCase().includes('precision') 
                 ? 'Desktop' : 'Desktop' // Todos parecen ser desktops

    await prisma.equipo.update({
      where: { id: equipo.id },
      data: { tipo }
    })

    console.log(`Actualizado ${equipo.serial}: tipo = ${tipo}`)
  }

  console.log('¡Migración completada!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
