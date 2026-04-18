// @ts-ignore - direct import from generated output
const { PrismaClient } = require("../src/generated/prisma/client");
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
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

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Perfume", nameUz: "Parfyum" },
    }),
    prisma.category.create({
      data: { name: "Eau de Toilette", nameUz: "Tualet suvi" },
    }),
    prisma.category.create({
      data: { name: "Body Mist", nameUz: "Badan spreyi" },
    }),
    prisma.category.create({
      data: { name: "Skincare", nameUz: "Teri parvarishi" },
    }),
    prisma.category.create({
      data: { name: "Hair Care", nameUz: "Soch parvarishi" },
    }),
    prisma.category.create({
      data: { name: "Gift Sets", nameUz: "Sovg'a to'plamlari" },
    }),
  ]);

  const [perfume, edt, bodyMist, skincare, hairCare, giftSets] = categories;

  // Create products
  const products = [
    // Perfumes
    {
      name: "TAMBURINS Perfume - BERGA SANDAL",
      nameUz: "TAMBURINS Parfyum - BERGA SANDAL",
      description: "A luxurious blend of bergamot and sandalwood. Top notes of fresh bergamot transition into a warm sandalwood base, creating an elegant and lasting fragrance.",
      descriptionUz: "Bergamot va sandal daraxtining hashamatli aralashmasi. Yangi bergamotning yuqori notalari iliq sandal asosiga o'tadi, nafis va uzoq muddatli xushbo'y hid yaratadi.",
      priceKRW: 85000,
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
      categoryId: perfume.id,
      brand: "TAMBURINS",
      volume: "50ml",
      featured: true,
    },
    {
      name: "TAMBURINS Perfume - WOOD SALT",
      nameUz: "TAMBURINS Parfyum - WOOD SALT",
      description: "A unique combination of woody notes and sea salt. Fresh ocean breeze meets warm cedarwood for an unforgettable scent experience.",
      descriptionUz: "Yog'ochsimon notalar va dengiz tuzining noyob kombinatsiyasi. Yangi okean shabadasi iliq kedr daraxti bilan uchrashib, unutilmas hid tajribasini yaratadi.",
      priceKRW: 85000,
      image: "https://images.unsplash.com/photo-1594035910387-fbd1a37d tried?w=500",
      categoryId: perfume.id,
      brand: "TAMBURINS",
      volume: "50ml",
      featured: true,
    },
    {
      name: "LANEIGE Water Sleeping Mask Perfume",
      nameUz: "LANEIGE Suv uyqu niqobi parfyumi",
      description: "Inspired by the iconic sleeping mask, this perfume captures the fresh, dewy scent of hydration. Light, clean, and refreshing.",
      descriptionUz: "Mashhur uyqu niqobidan ilhomlangan bu parfyum namlantiruvchi yangi, shudring hidni ushlab turadi. Yengil, toza va tetiklashtiruvchi.",
      priceKRW: 68000,
      image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500",
      categoryId: perfume.id,
      brand: "LANEIGE",
      volume: "30ml",
      featured: true,
    },
    {
      name: "Sulwhasoo Concentrated Ginseng Perfume",
      nameUz: "Sulwhasoo Konsentrlangan Jenshen parfyumi",
      description: "Premium Korean ginseng fragrance. Rich, earthy, and luxurious. A signature scent that embodies Korean beauty tradition.",
      descriptionUz: "Premium Koreya jenshen xushbo'yligi. Boy, tabiiy va hashamatli. Koreya go'zallik an'anasini aks ettiruvchi noyob hid.",
      priceKRW: 120000,
      image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500",
      categoryId: perfume.id,
      brand: "Sulwhasoo",
      volume: "50ml",
      featured: true,
    },
    {
      name: "Innisfree Forest Walk Perfume",
      nameUz: "Innisfree O'rmon sayr parfyumi",
      description: "Capture the essence of Jeju Island forests. Pine, green tea, and fresh moss create a naturally calming fragrance.",
      descriptionUz: "Jeju oroli o'rmonlarining mohiyatini his eting. Qarag'ay, yashil choy va yangi mox tabiiy tinchlantiruvchi xushbo'ylik yaratadi.",
      priceKRW: 45000,
      image: "https://images.unsplash.com/photo-1595425964272-fc617a4e1e5a?w=500",
      categoryId: perfume.id,
      brand: "Innisfree",
      volume: "30ml",
    },

    // EDT
    {
      name: "HERA Sensual Eau de Toilette",
      nameUz: "HERA Hissiy tualet suvi",
      description: "A sensual and feminine fragrance with notes of peony, musk, and white tea. Perfect for everyday elegance.",
      descriptionUz: "Pion, mushk va oq choy notalari bilan hissiy va ayolona xushbo'ylik. Kundalik nafislik uchun mukammal.",
      priceKRW: 72000,
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500",
      categoryId: edt.id,
      brand: "HERA",
      volume: "50ml",
      featured: true,
    },
    {
      name: "AMOREPACIFIC Eau de Toilette",
      nameUz: "AMOREPACIFIC Tualet suvi",
      description: "Light and refreshing eau de toilette with green tea and bamboo notes. Embodies Korean minimalist beauty.",
      descriptionUz: "Yashil choy va bambuk notalari bilan yengil va tetiklashtiruvchi tualet suvi. Koreya minimalist go'zalligini aks ettiradi.",
      priceKRW: 95000,
      image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500",
      categoryId: edt.id,
      brand: "AMOREPACIFIC",
      volume: "50ml",
    },
    {
      name: "Missha Time Revolution EDT",
      nameUz: "Missha Vaqt inqilobi tualet suvi",
      description: "Inspired by the Time Revolution skincare line. A youthful, floral scent with notes of cherry blossom and white lily.",
      descriptionUz: "Time Revolution teri parvarishi seriyasidan ilhomlangan. Olcha guli va oq nilufar notalari bilan yoshlarcha, gullar xushbo'yligi.",
      priceKRW: 38000,
      image: "https://images.unsplash.com/photo-1594035910387-fbd1a37d5b91?w=500",
      categoryId: edt.id,
      brand: "MISSHA",
      volume: "30ml",
    },

    // Body Mist
    {
      name: "The Face Shop Cherry Blossom Body Mist",
      nameUz: "The Face Shop Olcha guli badan spreyi",
      description: "Delicate cherry blossom scent in a refreshing body mist. Light enough for daily use, beautiful enough for special moments.",
      descriptionUz: "Tetiklashtiruvchi badan spreyida nozik olcha guli hidi. Kundalik foydalanish uchun yetarlicha yengil, maxsus lahzalar uchun go'zal.",
      priceKRW: 18000,
      image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=500",
      categoryId: bodyMist.id,
      brand: "The Face Shop",
      volume: "150ml",
      featured: true,
    },
    {
      name: "Etude House Rose Body Mist",
      nameUz: "Etude House Atirgul badan spreyi",
      description: "Sweet rose body mist with a long-lasting formula. Hydrates and perfumes your skin simultaneously.",
      descriptionUz: "Uzoq muddatli formulali shirin atirgul badan spreyi. Teringizni bir vaqtda namlaydi va xushbo'y qiladi.",
      priceKRW: 15000,
      image: "https://images.unsplash.com/photo-1616094553584-5a07d38b5f5e?w=500",
      categoryId: bodyMist.id,
      brand: "Etude House",
      volume: "150ml",
    },
    {
      name: "Nature Republic Cotton Body Mist",
      nameUz: "Nature Republic Paxta badan spreyi",
      description: "Clean cotton scent body mist. Fresh, light, and perfect for a clean everyday fragrance.",
      descriptionUz: "Toza paxta hidli badan spreyi. Yangi, yengil va kundalik toza xushbo'ylik uchun mukammal.",
      priceKRW: 12000,
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500",
      categoryId: bodyMist.id,
      brand: "Nature Republic",
      volume: "120ml",
    },

    // Skincare
    {
      name: "Sulwhasoo First Care Activating Serum",
      nameUz: "Sulwhasoo Birinchi parvarish faollashtiruvchi serum",
      description: "The iconic first-step serum that preps skin for the rest of your routine. Powered by JAUM Balancing Complex.",
      descriptionUz: "Terini qolgan kundalik parvarish uchun tayyorlaydigan mashhur birinchi qadam serum. JAUM muvozanat kompleksi bilan.",
      priceKRW: 92000,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
      categoryId: skincare.id,
      brand: "Sulwhasoo",
      volume: "60ml",
      featured: true,
    },
    {
      name: "COSRX Advanced Snail Mucin Essence",
      nameUz: "COSRX Ilg'or salyangoz musin essensiyasi",
      description: "96.3% snail secretion filtrate. Repairs, hydrates, and protects skin. A K-beauty cult favorite.",
      descriptionUz: "96.3% salyangoz sekretsiyasi filtrati. Terini tiklaydi, namlaydi va himoya qiladi. K-beauty sevimli mahsuloti.",
      priceKRW: 25000,
      image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500",
      categoryId: skincare.id,
      brand: "COSRX",
      volume: "100ml",
    },
    {
      name: "Beauty of Joseon Glow Serum",
      nameUz: "Beauty of Joseon Porlash serumi",
      description: "Propolis and niacinamide serum for glowing skin. Brightens, hydrates, and soothes in one step.",
      descriptionUz: "Porloq teri uchun propolis va niasinamid serumi. Bir qadamda yorqinlashtiradi, namlaydi va tinchlantiradi.",
      priceKRW: 18000,
      image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=500",
      categoryId: skincare.id,
      brand: "Beauty of Joseon",
      volume: "30ml",
    },

    // Hair Care
    {
      name: "Mise en Scene Perfect Serum",
      nameUz: "Mise en Scene Mukammal serum",
      description: "Korea's #1 hair serum. Repairs damaged hair and adds brilliant shine. Argan oil and 7 botanical oils.",
      descriptionUz: "Koreyaning #1 soch serumi. Shikastlangan sochlarni tiklaydi va ajoyib porlash qo'shadi. Argan moyi va 7 ta o'simlik moyi.",
      priceKRW: 15000,
      image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500",
      categoryId: hairCare.id,
      brand: "Mise en Scene",
      volume: "80ml",
    },
    {
      name: "Ryo Jayangyunmo Hair Loss Shampoo",
      nameUz: "Ryo Jayangyunmo soch to'kilishiga qarshi shampun",
      description: "Premium anti-hair loss shampoo with Korean herbal medicine. Strengthens roots and promotes healthy growth.",
      descriptionUz: "Koreya o'simlik tibbiyoti bilan premium soch to'kilishiga qarshi shampun. Ildizlarni mustahkamlaydi va sog'lom o'sishni rag'batlantiradi.",
      priceKRW: 22000,
      image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500",
      categoryId: hairCare.id,
      brand: "Ryo",
      volume: "400ml",
    },

    // Gift Sets
    {
      name: "TAMBURINS Discovery Set",
      nameUz: "TAMBURINS Kashfiyot to'plami",
      description: "Experience 5 iconic TAMBURINS fragrances in travel-size bottles. The perfect introduction to the brand.",
      descriptionUz: "5 ta mashhur TAMBURINS xushbo'yligini sayohat hajmidagi shishalarda his eting. Brend bilan tanishish uchun mukammal.",
      priceKRW: 65000,
      image: "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=500",
      categoryId: giftSets.id,
      brand: "TAMBURINS",
      volume: "5 x 11ml",
      featured: true,
    },
    {
      name: "Sulwhasoo Essential Comfort Set",
      nameUz: "Sulwhasoo Muhim qulaylik to'plami",
      description: "Complete skincare ritual set including First Care Serum, Essential Comfort Cream, and Eye Cream.",
      descriptionUz: "Birinchi parvarish serumi, Essential Comfort kremi va ko'z kremini o'z ichiga olgan to'liq teri parvarishi to'plami.",
      priceKRW: 180000,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500",
      categoryId: giftSets.id,
      brand: "Sulwhasoo",
      volume: "3 items",
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        description: product.description,
        images: "[]",
      },
    });
  }

  // Create initial exchange rate
  await prisma.exchangeRate.create({
    data: { rate: 1350, source: "initial-seed" },
  });

  console.log("Seed completed successfully!");
  console.log("Admin login: admin@koreaperfume.uz / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
