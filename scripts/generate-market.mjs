/**
 * Generador de datos mockup del Mercado Central de BDO.
 * Produce ~200 items realistas en data/market-items.json
 *
 * Uso:  node scripts/generate-market.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../data/market-items.json");

// PRNG determinista para que el mockup sea reproducible.
let seed = 20260708;
const rng = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const rand = (min, max) => min + rng() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const chance = (p) => rng() < p;

const MainCategory = {
  MainWeapon: 1, Awakening: 5, SubWeapon: 10, Armor: 15, Accessory: 20,
  Material: 25, Enhancement: 30, Recovery: 35, Consumable: 40, LifeTool: 45,
  Mount: 50, Ship: 55, Furniture: 60, AlchemyStone: 65, MagicCrystal: 70, Book: 75,
};

const ENH_LABELS = ["+0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10",
  "+11","+12","+13","+14","+15","PRI","DUO","TRI","TET","PEN"];

// Pools de nombres reales agrupados. grade: 0..4
const POOLS = {
  mainWeapon: {
    main: MainCategory.MainWeapon, sub: 1, label: "Arma principal",
    weight: 1.5, base: [4_000_000, 90_000_000], grade: 3, enhanceable: true,
    names: ["Kzarka", "Blackstar", "Dandelion", "Krea", "Yuria", "Rosar",
      "Liverto", "Styd", "Kalis", "Bares"],
    suffix: ["Longsword","Blade","Amulet","Kriegsmesser","Vitclari","Shuriken",
      "Crescent Blade","Battle Axe","Iron Buster","Sura Katana","Staff","Ornate Axe"],
  },
  awakening: {
    main: MainCategory.Awakening, sub: 1, label: "Arma de despertar",
    weight: 3.0, base: [3_000_000, 60_000_000], grade: 3, enhanceable: true,
    names: ["Dim Magic","Blackstar Awakening","Fallen God's"],
    suffix: ["Greatsword","Aad Sphera","Kamasylven Sword","Halberd","Trident",
      "Vediant","Lancia","Godr-Ayed"],
  },
  subWeapon: {
    main: MainCategory.SubWeapon, sub: 1, label: "Arma secundaria",
    weight: 1.2, base: [2_000_000, 55_000_000], grade: 3, enhanceable: true,
    names: ["Nouver","Kutum","Cadry","Saiyer","Basilisk"],
    suffix: ["Dagger","Shield","Talisman","Ornamental Knot","Trinket","Horn Bow","Vambrace"],
  },
  armor: {
    main: MainCategory.Armor, sub: 1, label: "Armadura",
    weight: 3.0, base: [3_000_000, 70_000_000], grade: 3, enhanceable: true,
    names: ["Griffon's Helmet","Giath's Helmet","Dim Tree Spirit's Armor",
      "Red Nose's Armor","Bheg's Gloves","Leebur's Gloves","Urugon's Shoes",
      "Muskan's Shoes","Grunil Helmet","Grunil Armor","Heve Gloves","Heve Shoes",
      "Rocaba Armor","Agerian Helmet","Blackstar Helmet","Blackstar Armor",
      "Fallen God's Armor","Labreska's Helmet"],
    suffix: [""],
  },
  accessory: {
    main: MainCategory.Accessory, sub: 1, label: "Accesorio",
    weight: 0.1, base: [5_000_000, 120_000_000], grade: 4, enhanceable: true,
    names: ["Ogre Ring","Tungrad Ring","Ring of Crescent Guardian","Ring of Cadry Guardian",
      "Basilisk's Belt","Tungrad Belt","Valtarra Eclipsed Belt","Orkinrad's Belt",
      "Tungrad Earring","Witch's Earring","Distortion Earring","Serap's Necklace",
      "Laytenn's Power Stone","Sicil's Necklace","Deboreka Necklace","Deboreka Earring",
      "Deboreka Ring","Deboreka Belt","Manos Necklace","Ominous Ring"],
    suffix: [""],
  },
  enhancement: {
    main: MainCategory.Enhancement, sub: 1, label: "Mejora",
    weight: 0.1, base: [30_000, 6_000_000], grade: 1, enhanceable: false,
    names: ["Black Stone (Weapon)","Black Stone (Armor)",
      "Concentrated Magical Black Stone (Weapon)","Concentrated Magical Black Stone (Armor)",
      "Memory Fragment","Caphras Stone","Sharp Black Crystal Shard",
      "Hard Black Crystal Shard","Cron Stone","Ancient Spirit Dust",
      "Black Gem Fragment","Concentrated Boss's Aura","Chaos Crystal","Fire Horn"],
    suffix: [""],
  },
  material: {
    main: MainCategory.Material, sub: 1, label: "Material",
    weight: 0.3, base: [500, 400_000], grade: 0, enhanceable: false,
    names: ["Wild Grass","Weeds","Fir Timber","Pine Timber","Iron Ore","Copper Ore",
      "Melted Iron Shard","Steel","Trace of Death","Trace of Savagery","Trace of Origin",
      "Powder of Time","Powder of Flame","Magical Shard","Ash Timber","Zinc Ore",
      "Coal","Silver Azalea","Sunrise Herb","Trace of Hunting"],
    suffix: [""],
  },
  recovery: {
    main: MainCategory.Recovery, sub: 1, label: "Recuperacion",
    weight: 0.1, base: [1_000, 150_000], grade: 1, enhanceable: false,
    names: ["Health Potion (Small)","Health Potion (Medium)","Health Potion (Large)",
      "Mana Potion (Medium)","Grilled Bird Meat","Elixir of Regeneration",
      "Whale Tendon Potion","Spirit Perfume Elixir"],
    suffix: [""],
  },
  consumable: {
    main: MainCategory.Consumable, sub: 1, label: "Consumible",
    weight: 0.1, base: [3_000, 300_000], grade: 2, enhanceable: false,
    names: ["Serendia Meal","Balenos Meal","Valencia Meal","King of Jungle Hamburg",
      "Milk Tea","Meat Croquette","Kamasylvia Meal","Frenzy Draught","Beast's Draught",
      "Verdure Draught","Elixir of Frenzy","Draught of Fury","Exquisite Cron Meal",
      "Simple Cron Meal","Margoria Seafood Meal"],
    suffix: [""],
  },
  lifeTool: {
    main: MainCategory.LifeTool, sub: 1, label: "Herramienta de vida",
    weight: 1.5, base: [20_000, 2_000_000], grade: 2, enhanceable: false,
    names: ["Manos Fluid Collector","Loggia Fishing Rod","Manos Fishing Rod",
      "Loggia Hoe","Manos Butcher Knife","Manos Tanning Knife","Lucky Loggia Pickaxe",
      "Magical Fluid Collector","Balenos Fishing Rod"],
    suffix: [""],
  },
  alchemyStone: {
    main: MainCategory.AlchemyStone, sub: 1, label: "Piedra de alquimia",
    weight: 0.2, base: [1_000_000, 45_000_000], grade: 3, enhanceable: false,
    names: ["Spirit's Alchemy Stone of Destruction","Spirit's Alchemy Stone of Protection",
      "Spirit's Alchemy Stone of Life","Vell's Concentrated Magic","Corrupt Oil of Immortality"],
    suffix: [""],
  },
  magicCrystal: {
    main: MainCategory.MagicCrystal, sub: 1, label: "Cristal magico",
    weight: 0.1, base: [500_000, 30_000_000], grade: 2, enhanceable: false,
    names: ["Magic Crystal of Infinity - Adamantine","Magic Crystal of Infinity - Precision",
      "Black Magic Crystal - Harphia","Black Magic Crystal - Cobelinus",
      "Crystal of Elkarr","JIN Magic Crystal - Carmae","BON Magic Crystal - Cobelinus",
      "WON Magic Crystal - Hystria","Corrupted Magic Crystal","Ah'krad"],
    suffix: [""],
  },
  book: {
    main: MainCategory.Book, sub: 1, label: "Libro",
    weight: 0.1, base: [5_000, 500_000], grade: 1, enhanceable: false,
    names: ["Combat Skill Guide","Book of Training - Combat","Book of Training - Skill",
      "Ancient Language Codex","Odore's Journal"],
    suffix: [""],
  },
};

const round = (n) => Math.round(n / 100) * 100;

let nextId = 700001;
const items = [];

function makeItem(pool) {
  const namePart = pick(pool.names);
  const suf = pick(pool.suffix);
  const name = suf ? `${namePart} ${suf}` : namePart;
  const id = nextId++;
  const [lo, hi] = pool.base;
  const basePrice = round(rand(lo, hi));
  const priceMin = round(basePrice * rand(0.55, 0.85));
  const priceMax = round(basePrice * rand(1.15, 1.65));
  const currentStock = pool.enhanceable ? randInt(0, 40) : randInt(0, 250_000);
  const totalTrades = randInt(100, pool.enhanceable ? 90_000 : 25_000_000);
  const daysAgo = rand(0, 6);
  const lastSoldAt = new Date(Date.now() - daysAgo * 86400_000).toISOString();

  let enhancementLevels = null;
  if (pool.enhanceable) {
    // Accesorios: PRI..PEN. Gear: +0..PEN.
    const isAccessory = pool.main === MainCategory.Accessory;
    const start = isAccessory ? 16 : 0;
    const maxLvl = randInt(isAccessory ? 17 : 5, 20);
    enhancementLevels = [];
    for (let lvl = start; lvl <= maxLvl; lvl++) {
      const mult = Math.pow(1.9, Math.max(0, lvl - (isAccessory ? 15 : 14)));
      const price = round(basePrice * (lvl < 15 ? 1 + lvl * 0.03 : mult));
      enhancementLevels.push({
        level: lvl,
        label: ENH_LABELS[lvl],
        price,
        stock: randInt(0, lvl >= 18 ? 3 : 25),
        totalTrades: randInt(10, 40_000),
      });
    }
  }

  items.push({
    id, name, icon: `/icons/${id}.png`, grade: pool.grade,
    mainCategory: pool.main, subCategory: pool.sub, categoryLabel: pool.label,
    basePrice, priceMin, priceMax, currentStock, totalTrades,
    lastSoldPrice: round(basePrice * rand(0.9, 1.1)), lastSoldAt,
    weight: Number(pool.weight.toFixed(1)),
    enhancementLevels,
  });
}

// Distribucion objetivo ~200 items.
const PLAN = [
  ["mainWeapon", 22], ["awakening", 18], ["subWeapon", 16], ["armor", 26],
  ["accessory", 28], ["enhancement", 18], ["material", 24], ["recovery", 10],
  ["consumable", 18], ["lifeTool", 9], ["alchemyStone", 5], ["magicCrystal", 12],
  ["book", 4],
];

for (const [key, count] of PLAN) {
  for (let i = 0; i < count; i++) makeItem(POOLS[key]);
}

const snapshot = {
  region: "eu",
  updatedAt: new Date().toISOString(),
  items,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
console.log(`Generados ${items.length} items -> ${OUT}`);
