import * as Icons from "lucide-react";
import { getCategory } from "../utils/categories";

export default function CategoryBadge({ categoryId, size = "md" }) {
  const category = getCategory(categoryId);
  const Icon = Icons[category.icon] || Icons.MoreHorizontal;

  return (
    <span
      className={`category-badge category-badge-${size}`}
      style={{
        color: category.color,
        background: `${category.color}1a`,
        borderColor: `${category.color}33`
      }}
    >
      <Icon size={size === "sm" ? 13 : 15} />
      {category.label}
    </span>
  );
}