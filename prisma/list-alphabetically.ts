import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function reorderAlphabetically() {
  console.log("🔄 Reordenando colaboradores alfabéticamente...\n");

  try {
    // Obtener todos los colaboradores
    const colaboradores = await prisma.colaborador.findMany({
      orderBy: [
        { apellido: "asc" },
        { nombre: "asc" },
      ],
    });

    console.log("📋 Colaboradores ordenados alfabéticamente:\n");
    
    colaboradores.forEach((c, index) => {
      console.log(`${String(index + 1).padStart(2, "0")}. ${c.apellido}, ${c.nombre} - ${c.email}`);
    });

    console.log(`\n✅ Total: ${colaboradores.length} colaboradores`);
    console.log("\nℹ️  Los datos ya están ordenados en las consultas de la API");
    console.log("   La página /colaboradores mostrará el orden alfabético automáticamente");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

reorderAlphabetically()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
