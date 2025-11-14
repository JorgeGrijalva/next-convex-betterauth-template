import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando seed de la base de datos...");

  // Crear usuario Super Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  
  const admin = await prisma.user.upsert({
    where: { whatsapp: "5555555555" },
    update: {},
    create: {
      name: "Super Admin",
      whatsapp: "5555555555",
      email: "admin@flutv.com",
      password: adminPassword,
      role: "SUPER_ADMIN",
      referralCode: "ADMIN001",
      isActive: true,
      whatsappVerified: true,
    },
  });

  console.log("✅ Super Admin creado:", {
    whatsapp: admin.whatsapp,
    email: admin.email,
    role: admin.role,
  });

  // Crear algunos planes de ejemplo
  const plans = [
    {
      name: "Plan Básico",
      description: "Acceso a todos los canales en calidad SD",
      price: 199,
      currency: "MXN",
      duration: 30,
      features: JSON.stringify([
        "Más de 100 canales",
        "Calidad SD",
        "1 dispositivo simultáneo",
        "Soporte 24/7",
      ]),
      isActive: true,
    },
    {
      name: "Plan Premium",
      description: "Acceso a todos los canales en calidad HD",
      price: 299,
      currency: "MXN",
      duration: 30,
      features: JSON.stringify([
        "Más de 150 canales",
        "Calidad HD",
        "2 dispositivos simultáneos",
        "Soporte prioritario 24/7",
        "Canales premium incluidos",
      ]),
      isActive: true,
    },
    {
      name: "Plan VIP",
      description: "Acceso completo en calidad Full HD y 4K",
      price: 399,
      currency: "MXN",
      duration: 30,
      features: JSON.stringify([
        "Más de 200 canales",
        "Calidad Full HD y 4K",
        "3 dispositivos simultáneos",
        "Soporte VIP 24/7",
        "Todos los canales premium",
        "Contenido exclusivo",
      ]),
      isActive: true,
    },
  ];

  for (const planData of plans) {
    const existing = await prisma.plan.findFirst({
      where: { name: planData.name },
    });

    const plan = existing
      ? await prisma.plan.update({
          where: { id: existing.id },
          data: planData,
        })
      : await prisma.plan.create({
          data: planData,
        });

    console.log(`✅ Plan creado: ${plan.name} - $${plan.price} ${plan.currency}`);
  }

  // Crear configuración de afiliados por defecto
  const affiliateConfig = await prisma.affiliateConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      commissionType: "PERCENTAGE",
      percentage: 10.0,
      isActive: true,
      updatedBy: admin.id,
    },
  });

  console.log("✅ Configuración de afiliados creada:", {
    type: affiliateConfig.commissionType,
    percentage: affiliateConfig.percentage,
  });

  // Crear usuario de prueba (cliente)
  const clientPassword = await bcrypt.hash("cliente123", 12);
  
  const client = await prisma.user.upsert({
    where: { whatsapp: "5544332211" },
    update: {},
    create: {
      name: "Cliente Demo",
      whatsapp: "5544332211",
      email: "cliente@demo.com",
      password: clientPassword,
      role: "CLIENT",
      referralCode: "DEMO001",
      isActive: true,
    },
  });

  console.log("✅ Cliente demo creado:", {
    whatsapp: client.whatsapp,
    email: client.email,
  });

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📝 Credenciales de acceso:");
  console.log("\n👨‍💼 SUPER ADMIN:");
  console.log("   WhatsApp/Email: admin@flutv.com o 5555555555");
  console.log("   Contraseña: admin123");
  console.log("\n👤 CLIENTE DEMO:");
  console.log("   WhatsApp/Email: cliente@demo.com o 5544332211");
  console.log("   Contraseña: cliente123");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
