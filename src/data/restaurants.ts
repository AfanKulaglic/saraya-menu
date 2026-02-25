import { Product } from "@/types/product";

// ─── Restaurant Info ─────────────────────────────────────
export const restaurant = {
  name: "Bella Cucina",
  tagline: "Authentic Italian Kitchen",
  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80",
  address: "123 Main Street, Downtown",
  openHours: "10:00 AM – 11:00 PM",
  wifi: "BellaCucina_Guest",
  phone: "+1 (555) 123-4567",
};

// ─── Category Config (icon + label + color) ──────────────
export interface CategoryInfo {
  id: string;
  label: string;
  icon: string;
  color: string;  // tailwind bg class
}

export const categoryConfig: CategoryInfo[] = [
  { id: "all",      label: "All",       icon: "🍽️", color: "from-amber-400 to-orange-500" },
  { id: "popular",  label: "Popular",   icon: "🔥", color: "from-red-400 to-rose-500" },
  { id: "pizza",    label: "Pizza",     icon: "🍕", color: "from-yellow-400 to-amber-500" },
  { id: "pasta",    label: "Pasta",     icon: "🍝", color: "from-orange-400 to-red-400" },
  { id: "burgers",  label: "Burgers",   icon: "🍔", color: "from-amber-500 to-yellow-600" },
  { id: "sides",    label: "Sides",     icon: "🍟", color: "from-yellow-300 to-amber-400" },
  { id: "salads",   label: "Salads",    icon: "🥗", color: "from-green-400 to-emerald-500" },
  { id: "desserts", label: "Desserts",  icon: "🍰", color: "from-pink-400 to-rose-500" },
  { id: "drinks",   label: "Drinks",    icon: "🥤", color: "from-blue-400 to-cyan-500" },
];

// Flat string list kept for backward compat
export const menuCategories = [
  "All",
  "🔥 Popular",
  "Pizza",
  "Pasta",
  "Burgers",
  "Sides",
  "Salads",
  "Desserts",
  "Drinks",
];

// Map category name → icon for section headers
export const categoryIcons: Record<string, string> = {
  Pizza: "🍕",
  Pasta: "🍝",
  Burgers: "🍔",
  Sides: "🍟",
  Salads: "🥗",
  Desserts: "🍰",
  Drinks: "🥤",
};

// ─── Menu Products ───────────────────────────────────────
export const products: Product[] = [
  // Pizzas
  {
    id: "p1",
    restaurantId: "1",
    name: "Margherita Pizza",
    description:
      "Classic tomato sauce, fresh mozzarella, basil on a hand-tossed crust.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
    category: "Pizza",
    popular: true,
    addons: [
      { id: "a1", name: "Extra Cheese", price: 1.5 },
      { id: "a2", name: "Jalapeños", price: 0.99 },
      { id: "a3", name: "Mushrooms", price: 1.25 },
    ],
    variations: [
      {
        id: "v1",
        name: "Size",
        required: true,
        options: [
          { id: "v1o1", label: "Small (10\")", priceAdjustment: 0 },
          { id: "v1o2", label: "Medium (12\")", priceAdjustment: 3 },
          { id: "v1o3", label: "Large (16\")", priceAdjustment: 6 },
        ],
      },
    ],
  },
  {
    id: "p2",
    restaurantId: "1",
    name: "Pepperoni Pizza",
    description:
      "Loaded with spicy pepperoni and melted mozzarella cheese.",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80",
    category: "Pizza",
    popular: true,
    addons: [
      { id: "a1", name: "Extra Cheese", price: 1.5 },
      { id: "a4", name: "Bacon", price: 2.0 },
    ],
    variations: [
      {
        id: "v1",
        name: "Size",
        required: true,
        options: [
          { id: "v1o1", label: "Small (10\")", priceAdjustment: 0 },
          { id: "v1o2", label: "Medium (12\")", priceAdjustment: 3 },
          { id: "v1o3", label: "Large (16\")", priceAdjustment: 6 },
        ],
      },
    ],
  },
  {
    id: "p3",
    restaurantId: "1",
    name: "Four Cheese Pizza",
    description:
      "Mozzarella, gorgonzola, parmesan, and ricotta on a crispy crust.",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
    category: "Pizza",
    addons: [
      { id: "a1", name: "Extra Cheese", price: 1.5 },
      { id: "a3", name: "Mushrooms", price: 1.25 },
    ],
    variations: [
      {
        id: "v1",
        name: "Size",
        required: true,
        options: [
          { id: "v1o1", label: "Small (10\")", priceAdjustment: 0 },
          { id: "v1o2", label: "Medium (12\")", priceAdjustment: 3 },
          { id: "v1o3", label: "Large (16\")", priceAdjustment: 6 },
        ],
      },
    ],
  },

  // Pasta
  {
    id: "p4",
    restaurantId: "1",
    name: "Pasta Carbonara",
    description:
      "Creamy carbonara sauce with crispy pancetta and parmesan.",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80",
    category: "Pasta",
    popular: true,
    addons: [{ id: "a5", name: "Extra Pancetta", price: 2.5 }],
    variations: [
      {
        id: "v5",
        name: "Portion",
        required: true,
        options: [
          { id: "v5o1", label: "Regular", priceAdjustment: 0 },
          { id: "v5o2", label: "Large", priceAdjustment: 3.5 },
        ],
      },
      {
        id: "v6",
        name: "Pasta Type",
        required: false,
        options: [
          { id: "v6o1", label: "Spaghetti", priceAdjustment: 0 },
          { id: "v6o2", label: "Penne", priceAdjustment: 0 },
          { id: "v6o3", label: "Gluten-Free", priceAdjustment: 1.5 },
        ],
      },
    ],
  },
  {
    id: "p5",
    restaurantId: "1",
    name: "Spaghetti Bolognese",
    description:
      "Rich meat sauce simmered for hours over fresh spaghetti.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
    category: "Pasta",
    popular: true,
    variations: [
      {
        id: "v5",
        name: "Portion",
        required: true,
        options: [
          { id: "v5o1", label: "Regular", priceAdjustment: 0 },
          { id: "v5o2", label: "Large", priceAdjustment: 3.5 },
        ],
      },
    ],
  },
  {
    id: "p6",
    restaurantId: "1",
    name: "Fettuccine Alfredo",
    description: "Creamy Alfredo sauce with parmesan over fettuccine.",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80",
    category: "Pasta",
    variations: [
      {
        id: "v5",
        name: "Portion",
        required: true,
        options: [
          { id: "v5o1", label: "Regular", priceAdjustment: 0 },
          { id: "v5o2", label: "Large", priceAdjustment: 3.5 },
        ],
      },
      {
        id: "v7",
        name: "Protein Add-on",
        required: false,
        options: [
          { id: "v7o1", label: "Grilled Chicken", priceAdjustment: 3 },
          { id: "v7o2", label: "Shrimp", priceAdjustment: 4.5 },
          { id: "v7o3", label: "No Protein", priceAdjustment: 0 },
        ],
      },
    ],
  },

  // Burgers
  {
    id: "p7",
    restaurantId: "1",
    name: "Classic Cheeseburger",
    description:
      "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce.",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    category: "Burgers",
    popular: true,
    addons: [
      { id: "a6", name: "Extra Patty", price: 3.0 },
      { id: "a4", name: "Bacon", price: 2.0 },
    ],
    variations: [
      {
        id: "v2",
        name: "Size",
        required: true,
        options: [
          { id: "v2o1", label: "Regular", priceAdjustment: 0 },
          { id: "v2o2", label: "Double", priceAdjustment: 4 },
        ],
      },
    ],
  },
  {
    id: "p8",
    restaurantId: "1",
    name: "BBQ Bacon Burger",
    description:
      "Smoky BBQ sauce, crispy bacon, onion rings, and cheddar.",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80",
    category: "Burgers",
    popular: true,
    addons: [{ id: "a6", name: "Extra Patty", price: 3.0 }],
    variations: [
      {
        id: "v2",
        name: "Size",
        required: true,
        options: [
          { id: "v2o1", label: "Regular", priceAdjustment: 0 },
          { id: "v2o2", label: "Double", priceAdjustment: 4 },
        ],
      },
    ],
  },

  // Sides
  {
    id: "p9",
    restaurantId: "1",
    name: "Garlic Bread",
    description: "Freshly baked bread with garlic butter and herbs.",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&q=80",
    category: "Sides",
  },
  {
    id: "p10",
    restaurantId: "1",
    name: "Crispy Fries",
    description: "Golden crispy fries seasoned with sea salt.",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
    category: "Sides",
    variations: [
      {
        id: "v8",
        name: "Size",
        required: true,
        options: [
          { id: "v8o1", label: "Regular", priceAdjustment: 0 },
          { id: "v8o2", label: "Large", priceAdjustment: 2 },
        ],
      },
      {
        id: "v9",
        name: "Seasoning",
        required: false,
        options: [
          { id: "v9o1", label: "Classic Salt", priceAdjustment: 0 },
          { id: "v9o2", label: "Truffle Parmesan", priceAdjustment: 1.5 },
          { id: "v9o3", label: "Cajun Spice", priceAdjustment: 0.5 },
        ],
      },
    ],
  },
  {
    id: "p11",
    restaurantId: "1",
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella with marinara dipping sauce.",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&q=80",
    category: "Sides",
  },

  // Salads
  {
    id: "p12",
    restaurantId: "1",
    name: "Caesar Salad",
    description:
      "Crisp romaine, croutons, parmesan, and classic Caesar dressing.",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
    category: "Salads",
    popular: true,
    variations: [
      {
        id: "v10",
        name: "Size",
        required: true,
        options: [
          { id: "v10o1", label: "Side", priceAdjustment: 0 },
          { id: "v10o2", label: "Entrée", priceAdjustment: 3 },
        ],
      },
      {
        id: "v11",
        name: "Protein",
        required: false,
        options: [
          { id: "v11o1", label: "No Protein", priceAdjustment: 0 },
          { id: "v11o2", label: "Grilled Chicken", priceAdjustment: 3 },
          { id: "v11o3", label: "Grilled Shrimp", priceAdjustment: 4.5 },
        ],
      },
    ],
  },
  {
    id: "p13",
    restaurantId: "1",
    name: "Caprese Salad",
    description: "Fresh mozzarella, tomatoes, basil, and balsamic glaze.",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    category: "Salads",
  },

  // Desserts
  {
    id: "p14",
    restaurantId: "1",
    name: "Tiramisu",
    description:
      "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone.",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
    category: "Desserts",
    popular: true,
    variations: [
      {
        id: "v12",
        name: "Serving",
        required: true,
        options: [
          { id: "v12o1", label: "Single", priceAdjustment: 0 },
          { id: "v12o2", label: "Family Size", priceAdjustment: 8 },
        ],
      },
    ],
  },
  {
    id: "p15",
    restaurantId: "1",
    name: "Chocolate Cake",
    description: "Rich double chocolate cake with ganache frosting.",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
    category: "Desserts",
    variations: [
      {
        id: "v13",
        name: "Topping",
        required: false,
        options: [
          { id: "v13o1", label: "None", priceAdjustment: 0 },
          { id: "v13o2", label: "Whipped Cream", priceAdjustment: 0.5 },
          { id: "v13o3", label: "Ice Cream Scoop", priceAdjustment: 1.5 },
          { id: "v13o4", label: "Caramel Drizzle", priceAdjustment: 0.75 },
        ],
      },
    ],
  },
  {
    id: "p16",
    restaurantId: "1",
    name: "Panna Cotta",
    description: "Silky vanilla panna cotta with berry compote.",
    price: 7.49,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80",
    category: "Desserts",
  },

  // Drinks
  {
    id: "p17",
    restaurantId: "1",
    name: "Fresh Lemonade",
    description: "Freshly squeezed lemonade with mint.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80",
    category: "Drinks",
    variations: [
      {
        id: "v3",
        name: "Size",
        required: true,
        options: [
          { id: "v3o1", label: "Regular", priceAdjustment: 0 },
          { id: "v3o2", label: "Large", priceAdjustment: 1.5 },
        ],
      },
    ],
  },
  {
    id: "p18",
    restaurantId: "1",
    name: "Iced Coffee",
    description: "Cold brew with your choice of milk.",
    price: 4.49,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
    category: "Drinks",
    variations: [
      {
        id: "v3",
        name: "Size",
        required: true,
        options: [
          { id: "v3o1", label: "Regular", priceAdjustment: 0 },
          { id: "v3o2", label: "Large", priceAdjustment: 1.5 },
        ],
      },
      {
        id: "v14",
        name: "Milk",
        required: true,
        options: [
          { id: "v14o1", label: "Whole Milk", priceAdjustment: 0 },
          { id: "v14o2", label: "Oat Milk", priceAdjustment: 0.75 },
          { id: "v14o3", label: "Almond Milk", priceAdjustment: 0.75 },
          { id: "v14o4", label: "Black (No Milk)", priceAdjustment: 0 },
        ],
      },
    ],
  },
  {
    id: "p19",
    restaurantId: "1",
    name: "Milkshake",
    description: "Thick and creamy vanilla milkshake.",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80",
    category: "Drinks",
    variations: [
      {
        id: "v4",
        name: "Flavor",
        required: true,
        options: [
          { id: "v4o1", label: "Vanilla", priceAdjustment: 0 },
          { id: "v4o2", label: "Chocolate", priceAdjustment: 0 },
          { id: "v4o3", label: "Strawberry", priceAdjustment: 0 },
        ],
      },
      {
        id: "v3",
        name: "Size",
        required: true,
        options: [
          { id: "v3o1", label: "Regular", priceAdjustment: 0 },
          { id: "v3o2", label: "Large", priceAdjustment: 2 },
        ],
      },
    ],
  },
];
