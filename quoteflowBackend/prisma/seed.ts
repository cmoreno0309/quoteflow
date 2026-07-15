import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Datos de mentira para poder trabajar. Se insertan al correr `npm run setup`.
async function main() {
  await prisma.producto.createMany({
    skipDuplicates: true,
    data: [
      { sku: "HX-200", nombre: "Casco de seguridad HX-200", precio: 45.0, stock: 100 },
      { sku: "GX-10", nombre: "Guantes GX-10", precio: 12.5, stock: 500 },
      { sku: "RS-9", nombre: "Respirador RS-9", precio: 80.0, stock: 8 },
      { sku: "BT-50", nombre: "Botas industriales BT-50", precio: 60.0, stock: 40 },
    ],
  });

  await prisma.cliente.createMany({
    skipDuplicates: true,
    data: [
      { id: "CLI-001", nombre: "Minera Gold SAC", tier: "GOLD" },
      { id: "CLI-002", nombre: "Ferro Andes EIRL", tier: "SILVER" },
      { id: "CLI-003", nombre: "Constructora Sur", tier: "STANDARD" },
    ],
  });

  console.log("Seed listo: productos y clientes insertados.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
