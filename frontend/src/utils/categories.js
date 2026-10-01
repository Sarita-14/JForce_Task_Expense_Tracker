// Home Paradise — household expense categories with keyword auto-detection.

export const CATEGORIES = [
  {
    id: "milk",
    label: "Milk",
    icon: "Milk",
    color: "#60a5fa",
    keywords: ["milk", "dairy", "milkman", "doodh"]
  },
  {
    id: "electricity",
    label: "Electricity Bill",
    icon: "Zap",
    color: "#fbbf24",
    keywords: ["electricity", "light bill", "electric", "bijli", "power bill", "mseb", "torrent", "wesco", "current"]
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: "Wrench",
    color: "#94a3b8",
    keywords: ["maintenance", "society", "repair", "plumber", "electrician", "carpenter", "building", "society fee"]
  },
  {
    id: "cleaner",
    label: "House Cleaner",
    icon: "Sparkles",
    color: "#a78bfa",
    keywords: ["cleaner", "maid", "bai", "cleaning", "sweep", "housekeeping", "jhaadu", "kaamwali"]
  },
  {
    id: "press",
    label: "Clothes Press",
    icon: "Shirt",
    color: "#34d399",
    keywords: ["press", "iron", "dhobi", "laundry", "washing", "clothes press"]
  },
  {
    id: "transport",
    label: "Rickshaw / Travel",
    icon: "Bike",
    color: "#3b82f6",
    keywords: ["rickshaw", "auto", "rick", "uber", "ola", "cab", "taxi", "bus", "train", "metro", "petrol", "fuel", "transport", "travel"]
  },
  {
    id: "vegetables",
    label: "Vegetables & Fruits",
    icon: "Carrot",
    color: "#22c55e",
    keywords: ["vegetables", "sabzi", "sabji", "onion", "tomato", "potato", "fruit", "fruits", "green", "carrot", "palak", "pyaz", "tamatar"]
  },
  {
    id: "food",
    label: "Food & Dining Out",
    icon: "UtensilsCrossed",
    color: "#f97316",
    keywords: ["lunch", "dinner", "breakfast", "restaurant", "hotel", "outside", "swiggy", "zomato", "pizza", "cafe", "snack", "chai", "food", "eating out"]
  },
  {
    id: "ration",
    label: "Ration & Groceries",
    icon: "Package",
    color: "#d97706",
    keywords: ["ration", "grocery", "groceries", "rice", "wheat", "flour", "dal", "pulses", "oil", "ghee", "sugar", "salt", "atta", "chawal", "masala", "spices", "biscuit", "soap", "detergent", "kirana"]
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "ShoppingBag",
    color: "#ec4899",
    keywords: ["shopping", "amazon", "flipkart", "mall", "dress", "shoes", "myntra", "market", "bag", "buy"]
  },
  {
    id: "pocket",
    label: "Pocket Money",
    icon: "Wallet",
    color: "#8b5cf6",
    keywords: ["pocket money", "pocket", "allowance", "weekly money", "kids money", "children"]
  },
  {
    id: "other",
    label: "Other",
    icon: "MoreHorizontal",
    color: "#6b7280",
    keywords: []
  }
];

export const DEFAULT_CATEGORY_ID = "other";

export function getCategory(id) {
  return (
    CATEGORIES.find((category) => category.id === id) ||
    CATEGORIES.find((category) => category.id === DEFAULT_CATEGORY_ID)
  );
}

// Suggests a category id by matching keywords found in the expense title/description.
export function suggestCategory(text) {
  if (!text) return DEFAULT_CATEGORY_ID;

  const normalized = text.toLowerCase();

  for (const category of CATEGORIES) {
    if (category.keywords.some((keyword) => normalized.includes(keyword))) {
      return category.id;
    }
  }

  return DEFAULT_CATEGORY_ID;
}