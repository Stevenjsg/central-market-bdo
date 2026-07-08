/**
 * Estructura de datos del Mercado Central (Central Market) de Black Desert Online.
 *
 * Modelada a partir de los campos que expone el juego real. Cada item del mercado
 * tiene un id numerico, una categoria principal + subcategoria, un "grade" (rareza)
 * y datos de mercado (precio, stock, transacciones). El equipo mejorable
 * (armas / armadura / accesorios) se lista por nivel de mejora, por eso existe
 * `enhancementLevels`.
 */

/** Rareza del item. En BDO se representa por color de borde/nombre. */
export enum ItemGrade {
  White = 0,  // General / gris-blanco
  Green = 1,  // Poco comun
  Blue = 2,   // Raro
  Yellow = 3, // Unico (naranja-dorado, ej. gear de boss)
  Orange = 4, // Antiguo / legendario (ej. Blackstar, Deboreka)
}

/** Categoria principal (mainCategory) — codigos alineados con el mercado real. */
export enum MainCategory {
  MainWeapon = 1,
  Awakening = 5,
  SubWeapon = 10,
  Armor = 15,
  Accessory = 20,
  Material = 25,
  Enhancement = 30, // Piedras negras, fragmentos de memoria, caphras...
  Recovery = 35,    // Pociones
  Consumable = 40,  // Elixires, comida, draughts
  LifeTool = 45,    // Herramientas de vida
  Mount = 50,
  Ship = 55,
  Furniture = 60,
  AlchemyStone = 65,
  MagicCrystal = 70,
  Book = 75,        // Libros de habilidad / conocimiento
}

/** Niveles de mejora clasicos de BDO. */
export type EnhancementLabel =
  | "+0" | "+1" | "+2" | "+3" | "+4" | "+5" | "+6" | "+7"
  | "+8" | "+9" | "+10" | "+11" | "+12" | "+13" | "+14" | "+15"
  | "PRI" | "DUO" | "TRI" | "TET" | "PEN";

/** Precio/stock de un nivel de mejora concreto de un item de equipo. */
export interface EnhancementLevel {
  /** 0..20; 16=PRI, 17=DUO, 18=TRI, 19=TET, 20=PEN */
  level: number;
  label: EnhancementLabel;
  /** Precio actual por unidad (silver). */
  price: number;
  /** Unidades disponibles ahora mismo en el mercado. */
  stock: number;
  /** Transacciones acumuladas historicas. */
  totalTrades: number;
}

export interface MarketItem {
  /** Id numerico unico del item (como en el juego). */
  id: number;
  name: string;
  /** Ruta al icono. Placeholder: /icons/<id>.png */
  icon: string;
  grade: ItemGrade;

  mainCategory: MainCategory;
  /** Subcategoria numerica dentro de la principal. */
  subCategory: number;
  /** Etiqueta legible de la subcategoria (derivada, para la UI). */
  categoryLabel: string;

  /** Precio base actual por unidad (silver). */
  basePrice: number;
  /** Limite inferior/superior de precio permitido por el mercado (price cap). */
  priceMin: number;
  priceMax: number;

  /** Unidades en venta ahora mismo. */
  currentStock: number;
  /** Transacciones acumuladas historicas. */
  totalTrades: number;

  /** Ultima venta registrada. */
  lastSoldPrice: number;
  lastSoldAt: string; // ISO 8601

  /** Peso por unidad en LT (Light Tons). */
  weight: number;

  /**
   * Solo para equipo mejorable. Cada entrada es un nivel de mejora listado
   * por separado en el mercado (como en el juego real). null si no aplica.
   */
  enhancementLevels: EnhancementLevel[] | null;
}

/** Snapshot completo del mercado para una region. */
export interface MarketSnapshot {
  region: string;      // ej. "eu", "na", "ko"
  updatedAt: string;   // ISO 8601
  items: MarketItem[];
}
