import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const mod = await import("../src/generated/prisma/client.ts");
const { default: bcrypt } = await import("bcryptjs");

const PrismaClient = mod.PrismaClient;
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@koreaperfume.uz" },
    update: {},
    create: {
      email: "admin@koreaperfume.uz", password: adminPassword,
      name: "Admin", phone: "+998901234567", telegram: "@koreaperfume_admin",
      address: "Admin office", city: "Toshkent", district: "Yunusobod", role: "ADMIN",
    },
  });

  const cats = await Promise.all([
    prisma.category.create({ data: { name: "Perfume", nameUz: "Parfyum" } }),
    prisma.category.create({ data: { name: "Eau de Toilette", nameUz: "Tualet suvi" } }),
    prisma.category.create({ data: { name: "Body Mist", nameUz: "Badan spreyi" } }),
    prisma.category.create({ data: { name: "Skincare", nameUz: "Teri parvarishi" } }),
    prisma.category.create({ data: { name: "Hair Care", nameUz: "Soch parvarishi" } }),
    prisma.category.create({ data: { name: "Gift Sets", nameUz: "Sovg'a to'plamlari" } }),
  ]);
  const [pf, edt, bm, sk, hc, gs] = cats;

  const prods = [
    { name: "TAMBURINS - BERGA SANDAL", nameUz: "TAMBURINS Parfyum - BERGA SANDAL", description: "Luxurious bergamot and sandalwood blend", descriptionUz: "Bergamot va sandal aralashmasi", priceKRW: 85000, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500", categoryId: pf.id, brand: "TAMBURINS", volume: "50ml", featured: true },
    { name: "TAMBURINS - WOOD SALT", nameUz: "TAMBURINS Parfyum - WOOD SALT", description: "Woody notes and sea salt", descriptionUz: "Yog'och va dengiz tuzi", priceKRW: 85000, image: "https://images.unsplash.com/photo-1594035910387-fbd1a37d5b91?w=500", categoryId: pf.id, brand: "TAMBURINS", volume: "50ml", featured: true },
    { name: "LANEIGE Water Perfume", nameUz: "LANEIGE Suv parfyumi", description: "Fresh dewy hydration scent", descriptionUz: "Yangi shudring hid", priceKRW: 68000, image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500", categoryId: pf.id, brand: "LANEIGE", volume: "30ml", featured: true },
    { name: "Sulwhasoo Ginseng Perfume", nameUz: "Sulwhasoo Jenshen parfyumi", description: "Premium Korean ginseng fragrance", descriptionUz: "Premium jenshen xushbo'yligi", priceKRW: 120000, image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500", categoryId: pf.id, brand: "Sulwhasoo", volume: "50ml", featured: true },
    { name: "Innisfree Forest Walk", nameUz: "Innisfree O'rmon sayr", description: "Pine, green tea, fresh moss", descriptionUz: "Qarag'ay va yashil choy", priceKRW: 45000, image: "https://images.unsplash.com/photo-1595425964272-fc617a4e1e5a?w=500", categoryId: pf.id, brand: "Innisfree", volume: "30ml", featured: false },
    { name: "HERA Sensual EDT", nameUz: "HERA Hissiy tualet suvi", description: "Peony and musk", descriptionUz: "Pion va mushk", priceKRW: 72000, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500", categoryId: edt.id, brand: "HERA", volume: "50ml", featured: true },
    { name: "AMOREPACIFIC EDT", nameUz: "AMOREPACIFIC Tualet suvi", description: "Green tea and bamboo", descriptionUz: "Yashil choy va bambuk", priceKRW: 95000, image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500", categoryId: edt.id, brand: "AMOREPACIFIC", volume: "50ml", featured: false },
    { name: "Missha Time Revolution", nameUz: "Missha tualet suvi", description: "Cherry blossom and lily", descriptionUz: "Olcha guli va nilufar", priceKRW: 38000, image: "https://images.unsplash.com/photo-1594035910387-fbd1a37d5b91?w=500", categoryId: edt.id, brand: "MISSHA", volume: "30ml", featured: false },
    { name: "Cherry Blossom Body Mist", nameUz: "Olcha guli badan spreyi", description: "Delicate cherry blossom", descriptionUz: "Nozik olcha guli", priceKRW: 18000, image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=500", categoryId: bm.id, brand: "The Face Shop", volume: "150ml", featured: true },
    { name: "Rose Body Mist", nameUz: "Atirgul badan spreyi", description: "Sweet rose mist", descriptionUz: "Shirin atirgul", priceKRW: 15000, image: "https://images.unsplash.com/photo-1616094553584-5a07d38b5f5e?w=500", categoryId: bm.id, brand: "Etude House", volume: "150ml", featured: false },
    { name: "Cotton Body Mist", nameUz: "Paxta badan spreyi", description: "Clean cotton scent", descriptionUz: "Toza paxta hidi", priceKRW: 12000, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500", categoryId: bm.id, brand: "Nature Republic", volume: "120ml", featured: false },
    { name: "Sulwhasoo Activating Serum", nameUz: "Sulwhasoo faollashtiruvchi serum", description: "Iconic first-step serum", descriptionUz: "Birinchi qadam serum", priceKRW: 92000, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500", categoryId: sk.id, brand: "Sulwhasoo", volume: "60ml", featured: true },
    { name: "COSRX Snail Mucin", nameUz: "COSRX Salyangoz essensiyasi", description: "96.3% snail secretion", descriptionUz: "96.3% salyangoz filtrati", priceKRW: 25000, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500", categoryId: sk.id, brand: "COSRX", volume: "100ml", featured: false },
    { name: "Beauty of Joseon Glow Serum", nameUz: "Porlash serumi", description: "Propolis and niacinamide", descriptionUz: "Propolis va niasinamid", priceKRW: 18000, image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=500", categoryId: sk.id, brand: "Beauty of Joseon", volume: "30ml", featured: false },
    { name: "Mise en Scene Perfect Serum", nameUz: "Mukammal soch serumi", description: "#1 hair serum in Korea", descriptionUz: "#1 soch serumi", priceKRW: 15000, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500", categoryId: hc.id, brand: "Mise en Scene", volume: "80ml", featured: false },
    { name: "Ryo Anti-Hair Loss Shampoo", nameUz: "Ryo soch shampuni", description: "Premium anti-hair loss", descriptionUz: "Soch to'kilishiga qarshi", priceKRW: 22000, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500", categoryId: hc.id, brand: "Ryo", volume: "400ml", featured: false },
    { name: "TAMBURINS Discovery Set", nameUz: "TAMBURINS Kashfiyot to'plami", description: "5 iconic fragrances", descriptionUz: "5 ta mashhur xushbo'ylik", priceKRW: 65000, image: "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=500", categoryId: gs.id, brand: "TAMBURINS", volume: "5 x 11ml", featured: true },
    { name: "Sulwhasoo Essential Set", nameUz: "Sulwhasoo qulaylik to'plami", description: "Complete skincare set", descriptionUz: "To'liq teri parvarishi", priceKRW: 180000, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500", categoryId: gs.id, brand: "Sulwhasoo", volume: "3 items", featured: false },
  ];

  for (const p of prods) {
    await prisma.product.create({ data: { ...p, images: "[]" } });
  }

  await prisma.exchangeRate.create({ data: { rate: 1350, source: "initial-seed" } });
  console.log("Seed completed! Admin: admin@koreaperfume.uz / admin123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
