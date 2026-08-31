import { getCategory } from "./categories";

export function exportExpensesToCSV(expenses, categoryMap, filename = "expenses.csv") {
  const header = ["Title", "Amount", "Date", "Category", "Description"];

  const rows = expenses.map((expense) => {
    const category = getCategory(categoryMap[expense.id]).label;
    const description = (expense.description || "").replace(/"/g, '""');

    return [
      `"${expense.title.replace(/"/g, '""')}"`,
      expense.amount,
      expense.date,
      category,
      `"${description}"`
    ].join(",");
  });

  const csvContent = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}