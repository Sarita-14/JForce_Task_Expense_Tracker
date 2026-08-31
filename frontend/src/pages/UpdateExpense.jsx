import { useState } from "react";
import { Calculator as CalculatorIcon, Loader2, Wallet } from "lucide-react";
import CategoryPicker from "../components/CategoryPicker.jsx";
import Calculator from "../components/Calculator.jsx";
import { DEFAULT_CATEGORY_ID } from "../utils/categories.js";
import { formatCurrency } from "../utils/format.js";

export default function UpdateExpense({ expense, initialCategory, onUpdate, onCancel, loading }) {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount);
  const [date, setDate] = useState(expense.date);
  const [description, setDescription] = useState(expense.description || "");
  const [category, setCategory] = useState(initialCategory || DEFAULT_CATEGORY_ID);
  const [errors, setErrors] = useState({});
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Expense name is required.";
    if (!amount || Number(amount) <= 0) nextErrors.amount = "Enter a valid amount.";
    if (!date) nextErrors.date = "Pick a date.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onUpdate(expense.id, { title, amount, date, description, category });
  }

  return (
    <main className="card form-card">
      <h1>Update Expense</h1>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          Expense Name
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </label>

        <label>
          <div className="label-row">
            <span>Amount</span>
            <button
              type="button"
              className="calculator-open-btn"
              onClick={() => setCalculatorOpen(true)}
            >
              <CalculatorIcon size={15} />
              Calculator
            </button>
          </div>
          <div className="input-with-icon">
            <Wallet size={17} />
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          {amount > 0 && (
            <span className="amount-preview">{formatCurrency(amount)}</span>
          )}
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </label>

        <label>
          Category
          <CategoryPicker value={category} onChange={setCategory} />
        </label>

        <label>
          Description
          <textarea
            rows="4"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <div className="form-buttons">
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Update Expense"}
          </button>
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>

      {calculatorOpen && (
        <Calculator
          onUseResult={(value) => {
            setAmount(value);
            setCalculatorOpen(false);
          }}
          onClose={() => setCalculatorOpen(false)}
        />
      )}
    </main>
  );
}