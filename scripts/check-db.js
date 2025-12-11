const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '../proyecto_anterior/prisma/dev.db')
const db = new Database(dbPath, { readonly: true })

console.log('Tablas en la base de datos anterior:\n')
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
tables.forEach(t => console.log(`  - ${t.name}`))

db.close()
