import { useMemo, useState } from "react";
import { Download, Pencil, Receipt, Search, Trash2 } from "lucide-react";
import CategoryBadge from "../components/CategoryBadge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import { CATEGORIES } from "../utils/categories.js";
import { exportExpensesToCSV } from "../utils/csv.js";
import { formatCurrency, formatDate } from "../utils/format.js";

const SORT_OPTIONS = [
  { id: "date-desc", label: "Newest first" },
  { id: "date-asc", label: "Oldest first" },
  { id: "amount-desc", label: "Amount: high to low" },
  { id: "amount-asc", label: "Amount: low to high" }
];

export default function ExpenseList({ expenses, categoryMap, onEdit, onDelete, loading }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const filteredExpenses = useMemo(() => {
    let result = expenses.filter((expense) => {
      const matchesSearch =
        !search ||
        expense.title.toLowerCase().includes(search.toLowerCase()) ||
        (expense.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || categoryMap[expense.id] === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount-desc") return Number(b.amount) - Number(a.amount);
      if (sortBy === "amount-asc") return Number(a.amount) - Number(b.amount);
      return 0;
    });

    return result;
  }, [expenses, search, categoryFilter, sortBy, categoryMap]);

  const filteredTotal = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  function confirmDelete() {
    onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return (
    <main className="card list-card">
      <div className="card-heading">
        <h1>Expense List</h1>
        <button
          className="secondary-btn"
          onClick={() => exportExpensesToCSV(filteredExpenses, categoryMap)}
          disabled={filteredExpenses.length === 0}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="list-toolbar">
        <div className="input-with-icon search-input">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filteredExpenses.length > 0 && (
        <p className="list-summary">
          Showing {filteredExpenses.length} expense
          {filteredExpenses.length === 1 ? "" : "s"} · Total{" "}
          <strong>{formatCurrency(filteredTotal)}</strong>
        </p>
      )}

      {loading ? (
        <Spinner label="Loading expenses..." />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expenses.length === 0 ? "No expenses found" : "No matches"}
          description={
            expenses.length === 0
              ? "Add your first expense to start tracking your spending."
              : "Try adjusting your search or filters."
          }
        />
      ) : (
        <div className="expense-list">
          {filteredExpenses.map((expense) => (
            <div className="expense-item" key={expense.id}>
              <div className="expense-info">
                <div className="expense-item-top">
                  <h2>{expense.title}</h2>
                  <CategoryBadge categoryId={categoryMap[expense.id]} size="sm" />
                </div>

                <p className="expense-amount">{formatCurrency(expense.amount)}</p>
                <p className="expense-date">{formatDate(expense.date)}</p>

                {expense.description && (
                  <p className="expense-description">{expense.description}</p>
                )}
              </div>

              <div className="expense-actions">
                <button className="edit-btn" onClick={() => onEdit(expense)}>
                  <Pencil size={14} />
                  Update
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setPendingDeleteId(expense.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this expense?"
        message="This action can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </main>
  );
}