import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes
  await prisma.servicioTecnico.deleteMany();
  await prisma.equipo.deleteMany();
  await prisma.colaborador.deleteMany();

  console.log("✅ Datos anteriores eliminados");

  // Crear colaboradores de prueba
  const colaborador1 = await prisma.colaborador.create({
    data: {
      nombre: "Juan",
      apellido: "Pérez",
      cargo: "Desarrollador Senior",
      email: "juan.perez@trackteam.com",
      ciudad: "Bogotá",
    },
  });

  const colaborador2 = await prisma.colaborador.create({
    data: {
      nombre: "María",
      apellido: "García",
      cargo: "Diseñadora UX/UI",
      email: "maria.garcia@trackteam.com",
      ciudad: "Medellín",
    },
  });

  const colaborador3 = await prisma.colaborador.create({
    data: {
      nombre: "Carlos",
      apellido: "Rodríguez",
      cargo: "Gerente de Proyectos",
      email: "carlos.rodriguez@trackteam.com",
      ciudad: "Cali",
    },
  });

  const colaborador4 = await prisma.colaborador.create({
    data: {
      nombre: "Ana",
      apellido: "Martínez",
      cargo: "Desarrolladora Frontend",
      email: "ana.martinez@trackteam.com",
      ciudad: "Bogotá",
    },
  });

  console.log("✅ Colaboradores creados:", 4);

  // Crear equipos de prueba
  const equipo1 = await prisma.equipo.create({
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

  const equipo2 = await prisma.equipo.create({
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

  const equipo3 = await prisma.equipo.create({
    data: {
      serial: "TT-2024-003",
      marca: "Lenovo",
      modelo: "ThinkPad X1 Carbon Gen 9",
      tipo: "Portátil",
      procesador: "Intel Core i7-1165G7",
      ram: 32,
      almacenamiento: "1TB SSD NVMe",
      gpu: "Intel Iris Xe Graphics",
      estadoSalud: "Bueno",
      fechaAdquisicion: new Date("2024-03-10"),
      colaboradorId: colaborador3.id,
    },
  });

  const equipo4 = await prisma.equipo.create({
    data: {
      serial: "TT-2024-004",
      marca: "Apple",
      modelo: "MacBook Pro 14",
      tipo: "Portátil",
      procesador: "Apple M1 Pro",
      ram: 16,
      almacenamiento: "512GB SSD",
      gpu: "Apple M1 Pro GPU",
      estadoSalud: "Bueno",
      fechaAdquisicion: new Date("2024-04-20"),
      colaboradorId: colaborador4.id,
    },
  });

  const equipo5 = await prisma.equipo.create({
    data: {
      serial: "TT-2023-015",
      marca: "Dell",
      modelo: "Optiplex 7080",
      tipo: "Desktop",
      procesador: "Intel Core i7-10700",
      ram: 16,
      almacenamiento: "512GB SSD",
      gpu: "Intel UHD Graphics 630",
      estadoSalud: "Malo",
      fechaAdquisicion: new Date("2023-06-15"),
      colaboradorId: null, // Sin asignar
    },
  });

  console.log("✅ Equipos creados:", 5);

  // Crear servicios técnicos de prueba
  await prisma.servicioTecnico.create({
    data: {
      tipo: "Preventivo",
      fechaServicio: new Date("2024-11-01"),
      problemas: "Mantenimiento programado trimestral",
      soluciones: "Limpieza interna, actualización de drivers, optimización de sistema",
      tiempoInvertido: 45,
      estadoResultante: "Bueno",
      equipoId: equipo1.id,
    },
  });

  await prisma.servicioTecnico.create({
    data: {
      tipo: "Correctivo",
      fechaServicio: new Date("2024-10-15"),
      problemas: "Lentitud general del sistema, errores al iniciar aplicaciones",
      soluciones: "Ampliación de RAM de 8GB a 16GB, reinstalación de Windows",
      tiempoInvertido: 120,
      estadoResultante: "Bueno",
      equipoId: equipo2.id,
    },
  });

  await prisma.servicioTecnico.create({
    data: {
      tipo: "Limpieza",
      fechaServicio: new Date("2024-11-10"),
      problemas: "Sobrecalentamiento, ventilador ruidoso",
      soluciones: "Limpieza profunda de ventiladores, reemplazo de pasta térmica",
      tiempoInvertido: 30,
      estadoResultante: "Bueno",
      equipoId: equipo3.id,
    },
  });

  await prisma.servicioTecnico.create({
    data: {
      tipo: "Correctivo",
      fechaServicio: new Date("2024-09-20"),
      problemas: "Disco duro fallando, errores S.M.A.R.T., sistema congelándose",
      soluciones: "Reemplazo de HDD 1TB por SSD 512GB, migración de datos",
      tiempoInvertido: 90,
      estadoResultante: "Regular",
      equipoId: equipo5.id,
    },
  });

  await prisma.servicioTecnico.create({
    data: {
      tipo: "Actualización de Software",
      fechaServicio: new Date("2024-11-15"),
      problemas: "Sistema operativo desactualizado, vulnerabilidades de seguridad",
      soluciones: "Actualización a macOS Sonoma, instalación de parches de seguridad",
      tiempoInvertido: 60,
      estadoResultante: "Bueno",
      equipoId: equipo4.id,
    },
  });

  console.log("✅ Servicios técnicos creados:", 5);

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📊 Resumen:");
  console.log("   - 4 Colaboradores");
  console.log("   - 5 Equipos (4 asignados, 1 sin asignar)");
  console.log("   - 5 Servicios técnicos");
  console.log("\n🌐 Puedes ver los datos en:");
  console.log("   - http://localhost:3000/colaboradores");
  console.log("   - npx prisma studio (GUI)");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
