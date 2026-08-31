// Central category registry.
// Each category has a color pair (bg/fg) used for badges and charts,
// plus keywords used to auto-suggest a category from an expense title.

export const CATEGORIES = [
  {
    id: "food",
    label: "Food & Dining",
    icon: "UtensilsCrossed",
    color: "#f97316",
    keywords: ["food", "lunch", "dinner", "breakfast", "restaurant", "cafe", "coffee", "snack", "pizza", "grocery", "groceries", "zomato", "swiggy"]
  },
  {
    id: "transport",
    label: "Transport",
    icon: "Car",
    color: "#3b82f6",
    keywords: ["uber", "ola", "taxi", "fuel", "petrol", "diesel", "bus", "train", "metro", "cab", "parking", "flight"]
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "ShoppingBag",
    color: "#ec4899",
    keywords: ["shopping", "amazon", "flipkart", "clothes", "shoes", "mall", "myntra"]
  },
  {
    id: "bills",
    label: "Bills & Utilities",
    icon: "Receipt",
    color: "#ef4444",
    keywords: ["bill", "electricity", "water", "internet", "wifi", "recharge", "rent", "gas", "phone"]
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: "Clapperboard",
    color: "#8b5cf6",
    keywords: ["movie", "netflix", "spotify", "game", "concert", "prime", "entertainment", "party"]
  },
  {
    id: "health",
    label: "Health",
    icon: "HeartPulse",
    color: "#10b981",
    keywords: ["medicine", "doctor", "hospital", "pharmacy", "health", "gym", "fitness"]
  },
  {
    id: "education",
    label: "Education",
    icon: "GraduationCap",
    color: "#0ea5e9",
    keywords: ["course", "book", "education", "tuition", "class", "udemy", "school", "college"]
  },
  {
    id: "travel",
    label: "Travel",
    icon: "Plane",
    color: "#14b8a6",
    keywords: ["travel", "hotel", "trip", "vacation", "airbnb", "booking"]
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