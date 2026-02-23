/**
 * Script to import cedula and direccion from Excel into the Colaborador table.
 * Matches by normalizing names (removing accents, lowering case).
 * 
 * Usage: npx tsx scripts/import-cedula-direccion.ts
 */

import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

// Normalize string: remove accents, lowercase, trim, collapse spaces
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Build a match key from first+last name for fuzzy comparison
function buildKey(nombre: string, apellido: string): string {
  const parts = normalize(`${nombre} ${apellido}`).split(' ').sort()
  return parts.join(' ')
}

async function main() {
  // 1. Read Excel
  const wb = XLSX.readFile('NomGhConHojasDeVidaGrid.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws)

  console.log(`\n📄 Excel: ${rows.length} filas leídas\n`)

  // 2. Build Excel data map
  const excelData = rows.map(row => {
    const cedula = String(row['Identificación'] || '').trim()
    const nombres = (row['Nombres'] || '').trim()
    const primerApellido = (row['Primer apellido'] || '').trim()
    const segundoApellido = (row['Segundo apellido'] || '').trim()
    const direccion = (row['Direccion 1'] || '').trim()
    const apellidos = `${primerApellido} ${segundoApellido}`.trim()

    return {
      cedula,
      nombres,
      apellidos,
      direccion,
      key: buildKey(nombres, apellidos),
    }
  })

  // 3. Get all collaborators from DB
  const colaboradores = await prisma.colaborador.findMany({
    select: { id: true, nombre: true, apellido: true, cedula: true, direccion: true },
  })

  console.log(`👥 BD: ${colaboradores.length} colaboradores\n`)
  console.log('─'.repeat(80))

  let updated = 0
  let skipped = 0
  const notFound: string[] = []

  // 4. Match and update
  for (const col of colaboradores) {
    const colKey = buildKey(col.nombre, col.apellido)
    
    // Find best match in Excel
    const match = excelData.find(e => e.key === colKey)

    if (!match) {
      // Try partial match: at least first name + first apellido
      const colParts = normalize(`${col.nombre} ${col.apellido}`).split(' ')
      const partialMatch = excelData.find(e => {
        const exParts = normalize(`${e.nombres} ${e.apellidos}`).split(' ')
        // Check if first name initial part matches and first apellido matches
        const colFirst = colParts[0]
        const colLast = colParts[colParts.length - 1]
        return exParts.some(p => p === colFirst) && exParts.some(p => p === colLast)
      })

      if (partialMatch) {
        const needsUpdate = !col.cedula || !col.direccion
        if (needsUpdate) {
          const updateData: Record<string, string> = {}
          if (!col.cedula && partialMatch.cedula) updateData.cedula = partialMatch.cedula
          if (!col.direccion && partialMatch.direccion) updateData.direccion = partialMatch.direccion

          if (Object.keys(updateData).length > 0) {
            await prisma.colaborador.update({
              where: { id: col.id },
              data: updateData,
            })
            console.log(`✅ ${col.nombre} ${col.apellido} ← (parcial) cédula: ${updateData.cedula || '—'} | dir: ${updateData.direccion || '—'}`)
            updated++
          } else {
            console.log(`⏭️  ${col.nombre} ${col.apellido} — sin datos nuevos en Excel`)
            skipped++
          }
        } else {
          console.log(`⏭️  ${col.nombre} ${col.apellido} — ya tiene datos`)
          skipped++
        }
        continue
      }

      notFound.push(`${col.nombre} ${col.apellido}`)
      continue
    }

    // Exact key match found
    const updateData: Record<string, string> = {}
    if (!col.cedula && match.cedula) updateData.cedula = match.cedula
    if (!col.direccion && match.direccion) updateData.direccion = match.direccion

    if (Object.keys(updateData).length > 0) {
      await prisma.colaborador.update({
        where: { id: col.id },
        data: updateData,
      })
      console.log(`✅ ${col.nombre} ${col.apellido} ← cédula: ${updateData.cedula || '—'} | dir: ${updateData.direccion || '—'}`)
      updated++
    } else {
      console.log(`⏭️  ${col.nombre} ${col.apellido} — ya tiene datos o Excel sin info`)
      skipped++
    }
  }

  console.log('─'.repeat(80))
  console.log(`\n📊 Resumen:`)
  console.log(`   ✅ Actualizados: ${updated}`)
  console.log(`   ⏭️  Omitidos: ${skipped}`)
  console.log(`   ❌ Sin match: ${notFound.length}`)
  if (notFound.length > 0) {
    console.log(`\n   Colaboradores sin match en Excel:`)
    notFound.forEach(n => console.log(`      - ${n}`))
  }
  console.log('')

  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
