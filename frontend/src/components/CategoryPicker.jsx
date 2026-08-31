import * as Icons from "lucide-react";
import { CATEGORIES } from "../utils/categories";

export default function CategoryPicker({ value, onChange }) {
  return (
    <div className="category-picker" role="radiogroup" aria-label="Category">
      {CATEGORIES.map((category) => {
        const Icon = Icons[category.icon] || Icons.MoreHorizontal;
        const active = value === category.id;

        return (
          <button
            type="button"
            key={category.id}
            role="radio"
            aria-checked={active}
            className={`category-chip ${active ? "active" : ""}`}
            style={
              active
                ? {
                    background: `${category.color}1f`,
                    borderColor: category.color,
                    color: category.color
                  }
                : undefined
            }
            onClick={() => onChange(category.id)}
          >
            <Icon size={16} />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}