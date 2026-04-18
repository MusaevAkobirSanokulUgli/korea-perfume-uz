import bcrypt from "bcryptjs";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@koreaperfume.uz" },
    update: {},
    create: {
      email: "admin@koreaperfume.uz",
      password: adminPassword,
      name: "Admin",
      phone: "+998901234567",
      telegram: "@koreaperfume_admin",
      address: "Admin office",
      city: "Toshkent",
      district: "Yunusobod",
      role: "ADMIN",
    },
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Perfume", nameUz: "Parfyum" } }),
    prisma.category.create({ data: { name: "Eau de Toilette", nameUz: "Tualet suvi" } }),
    prisma.category.create({ data: { name: "Body Mist", nameUz: "Badan spreyi" } }),
    prisma.category.create({ data: { name: "Skincare", nameUz: "Teri parvarishi" } }),
    prisma.category.create({ data: { name: "Hair Care", nameUz: "Soch parvarishi" } }),
    prisma.category.create({ data: { name: "Gift Sets", nameUz: "Sovg'a to'plamlari" } }),
  ]);

  const [perfume, edt, bodyMist, skincare, hairCare, giftSets] = categories;

  const products = [
    { name: "TAMBURINS Perfume - BERGA SANDAL", nameUz: "TAMBURINS Parfyum - BERGA SANDAL", description: "A luxurious blend of bergamot and sandalwood.", descriptionUz: "Bergamot va sandal daraxtining hashamatli aralashmasi.", priceKRW: 85000, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500", categoryId: perfume.id, brand: "TAMBURINS", volume: "50ml", featured: true },
    { name: "TAMBURINS Perfume - WOOD SALT", nameUz: "TAMBURINS Parfyum - WOOD SALT", description: "Woody notes and sea salt.", descriptionUz: "Yog'ochsimon notalar va dengiz tuzi.", priceKRW: 85000, image: "https://images.unsplash.com/photo-1594035910387-fbd1a37d5b91?w=500", categoryId: perfume.id, brand: "TAMBURINS", volume: "50ml", featured: true },
    { name: "LANEIGE Water Sleeping Mask Perfume", nameUz: "LANEIGE Suv uyqu niqobi parfyumi", description: "Fresh, dewy scent of hydration.", descriptionUz: "Namlantiruvchi yangi shudring hid.", priceKRW: 68000, image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500", categoryId: perfume.id, brand: "LANEIGE", volume: "30ml", featured: true },
    { name: "Sulwhasoo Concentrated Ginseng Perfume", nameUz: "Sulwhasoo Jenshen parfyumi", description: "Premium Korean ginseng fragrance.", descriptionUz: "Premium Koreya jenshen xushbo'yligi.", priceKRW: 120000, image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500", categoryId: perfume.id, brand: "Sulwhasoo", volume: "50ml", featured: true },
    { name: "Innisfree Forest Walk Perfume", nameUz: "Innisfree O'rmon sayr parfyumi", description: "Pine, green tea, and fresh moss.", descriptionUz: "Qarag'ay, yashil choy va yangi mox.", priceKRW: 45000, image: "https://images.unsplash.com/photo-1595425964272-fc617a4e1e5a?w=500", categoryId: perfume.id, brand: "Innisfree", volume: "30ml", featured: false },
    { name: "HERA Sensual Eau de Toilette", nameUz: "HERA Hissiy tualet suvi", description: "Sensual fragrance with peony and musk.", descriptionUz: "Pion va mushk notalari.", priceKRW: 72000, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500", categoryId: edt.id, brand: "HERA", volume: "50ml", featured: true },
    { name: "AMOREPACIFIC Eau de Toilette", nameUz: "AMOREPACIFIC Tualet suvi", description: "Green tea and bamboo.", descriptionUz: "Yashil choy va bambuk.", priceKRW: 95000, image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500", categoryId: edt.id, brand: "AMOREPACIFIC", volume: "50ml", featured: false },
    { name: "Missha Time Revolution EDT", nameUz: "Missha Vaqt inqilobi tualet suvi", description: "Cherry blossom and white lily.", descriptionUz: "Olcha guli va oq nilufar.", priceKRW: 38000, image: "https://images.unsplash.com/photo-1594035910387-fbd1a37d5b91?w=500", categoryId: edt.id, brand: "MISSHA", volume: "30ml", featured: false },
    { name: "The Face Shop Cherry Blossom Body Mist", nameUz: "The Face Shop Olcha guli badan spreyi", description: "Delicate cherry blossom.", descriptionUz: "Nozik olcha guli hidi.", priceKRW: 18000, image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=500", categoryId: bodyMist.id, brand: "The Face Shop", volume: "150ml", featured: true },
    { name: "Etude House Rose Body Mist", nameUz: "Etude House Atirgul badan spreyi", description: "Sweet rose body mist.", descriptionUz: "Shirin atirgul badan spreyi.", priceKRW: 15000, image: "https://images.unsplash.com/photo-1616094553584-5a07d38b5f5e?w=500", categoryId: bodyMist.id, brand: "Etude House", volume: "150ml", featured: false },
    { name: "Nature Republic Cotton Body Mist", nameUz: "Nature Republic Paxta badan spreyi", description: "Clean cotton scent.", descriptionUz: "Toza paxta hidi.", priceKRW: 12000, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500", categoryId: bodyMist.id, brand: "Nature Republic", volume: "120ml", featured: false },
    { name: "Sulwhasoo First Care Activating Serum", nameUz: "Sulwhasoo Birinchi parvarish serumi", description: "Iconic first-step serum.", descriptionUz: "Mashhur birinchi qadam serum.", priceKRW: 92000, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500", categoryId: skincare.id, brand: "Sulwhasoo", volume: "60ml", featured: true },
    { name: "COSRX Advanced Snail Mucin Essence", nameUz: "COSRX Salyangoz musin essensiyasi", description: "96.3% snail secretion filtrate.", descriptionUz: "96.3% salyangoz filtrati.", priceKRW: 25000, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500", categoryId: skincare.id, brand: "COSRX", volume: "100ml", featured: false },
    { name: "Beauty of Joseon Glow Serum", nameUz: "Beauty of Joseon Porlash serumi", description: "Propolis and niacinamide.", descriptionUz: "Propolis va niasinamid.", priceKRW: 18000, image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=500", categoryId: skincare.id, brand: "Beauty of Joseon", volume: "30ml", featured: false },
    { name: "Mise en Scene Perfect Serum", nameUz: "Mise en Scene Mukammal serum", description: "Korea's #1 hair serum.", descriptionUz: "Koreyaning #1 soch serumi.", priceKRW: 15000, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500", categoryId: hairCare.id, brand: "Mise en Scene", volume: "80ml", featured: false },
    { name: "Ryo Anti-Hair Loss Shampoo", nameUz: "Ryo soch to'kilishiga qarshi shampun", description: "Premium anti-hair loss.", descriptionUz: "Premium soch to'kilishiga qarshi.", priceKRW: 22000, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500", categoryId: hairCare.id, brand: "Ryo", volume: "400ml", featured: false },
    { name: "TAMBURINS Discovery Set", nameUz: "TAMBURINS Kashfiyot to'plami", description: "5 iconic fragrances.", descriptionUz: "5 ta mashhur xushbo'ylik.", priceKRW: 65000, image: "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=500", categoryId: giftSets.id, brand: "TAMBURINS", volume: "5 x 11ml", featured: true },
    { name: "Sulwhasoo Essential Comfort Set", nameUz: "Sulwhasoo Muhim qulaylik to'plami", description: "Complete skincare set.", descriptionUz: "To'liq teri parvarishi to'plami.", priceKRW: 180000, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500", categoryId: giftSets.id, brand: "Sulwhasoo", volume: "3 items", featured: false },
  ];

  for (const p of products) {
    await prisma.product.create({ data: { ...p, images: "[]" } });
  }

  await prisma.exchangeRate.create({ data: { rate: 1350, source: "initial-seed" } });

  console.log("Seed completed!");
  console.log("Admin: admin@koreaperfume.uz / admin123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
