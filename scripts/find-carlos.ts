import prisma from '../lib/prisma'

async function main() {
  const colaboradores = await prisma.colaborador.findMany({
    where: {
      OR: [
        { nombre: { contains: 'Carlos' } },
        { apellido: { contains: 'Sarria' } }
      ]
    },
    include: {
      equipos: true
    }
  })
  
  console.log('Colaboradores encontrados:')
  colaboradores.forEach(c => {
    console.log(`\n${c.nombre} ${c.apellido} (${c.cargo})`)
    console.log(`Equipos: ${c.equipos.length}`)
    c.equipos.forEach(e => {
      console.log(`  - ID: ${e.id}`)
      console.log(`    Serial: ${e.serial}`)
      console.log(`    ${e.marca} ${e.modelo} (${e.tipo})`)
      console.log(`    Estado: ${e.estadoSalud}`)
    })
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
