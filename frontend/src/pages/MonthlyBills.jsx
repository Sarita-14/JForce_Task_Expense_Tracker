import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Pencil, Save, X } from "lucide-react";
import {
  loadBills,
  loadBillStatus,
  saveBills,
  saveBillStatus
} from "../utils/bills.js";
import { formatCurrency } from "../utils/format.js";

function getYearMonth(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function displayMonth(ym) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleString("en-IN", { month: "long", year: "numeric" });
}

export default function MonthlyBills({ username, billStatus, onStatusChange, bills, onBillsChange }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const yearMonth = getYearMonth(monthOffset);
  const status = billStatus[yearMonth] || {};

  function togglePaid(billId) {
    const next = { ...status, [billId]: !status[billId] };
    onStatusChange(yearMonth, next);
  }

  function startEdit(bill) {
    setEditingId(bill.id);
    setEditName(bill.name);
    setEditAmount(String(bill.amount));
  }

  function saveEdit() {
    const updated = bills.map((b) =>
      b.id === editingId
        ? { ...b, name: editName.trim() || b.name, amount: Number(editAmount) || 0 }
        : b
    );
    onBillsChange(updated);
    setEditingId(null);
  }

  const totalDue = bills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = bills.filter((b) => status[b.id]).reduce((s, b) => s + b.amount, 0);
  const paidCount = bills.filter((b) => status[b.id]).length;

  return (
    <main className="bills-page">
      {/* Month navigator */}
      <div className="bills-month-nav card">
        <button className="icon-btn" onClick={() => setMonthOffset((o) => o - 1)}>
          <ChevronLeft size={20} />
        </button>
        <div className="bills-month-label">
          <span className="bills-month-title">{displayMonth(yearMonth)}</span>
          <span className="bills-month-sub">
            {paidCount} of {bills.length} bills paid
          </span>
        </div>
        <button
          className="icon-btn"
          onClick={() => setMonthOffset((o) => o + 1)}
          disabled={monthOffset >= 0}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary bar */}
      <div className="bills-summary">
        <div className="bills-summary-item paid">
          <span className="bills-summary-label">Paid</span>
          <span className="bills-summary-value">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="bills-summary-item pending">
          <span className="bills-summary-label">Pending</span>
          <span className="bills-summary-value">{formatCurrency(totalDue - totalPaid)}</span>
        </div>
        <div className="bills-summary-item total">
          <span className="bills-summary-label">Total</span>
          <span className="bills-summary-value">{formatCurrency(totalDue)}</span>
        </div>
      </div>

      {/* Bills list */}
      <div className="card bills-list-card">
        <div className="card-heading">
          <h2>Monthly Bills</h2>
          <span className="bills-hint">Click ✏️ to edit amount · Click status to toggle</span>
        </div>

        <div className="bills-list">
          {bills.map((bill) => (
            <div key={bill.id} className={`bill-row ${status[bill.id] ? "bill-paid" : "bill-pending"}`}>
              <span className="bill-icon">{bill.icon}</span>

              {editingId === bill.id ? (
                <div className="bill-edit-form">
                  <input
                    className="bill-edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Bill name"
                  />
                  <input
                    className="bill-edit-amount"
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Amount"
                    min="0"
                  />
                  <button className="icon-btn accent" onClick={saveEdit} title="Save">
                    <Save size={15} />
                  </button>
                  <button className="icon-btn" onClick={() => setEditingId(null)} title="Cancel">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="bill-info">
                    <span className="bill-name">{bill.name}</span>
                    <span className="bill-amount">
                      {bill.amount > 0 ? formatCurrency(bill.amount) : "—"}
                    </span>
                  </div>

                  <div className="bill-actions">
                    <button
                      className="icon-btn small"
                      onClick={() => startEdit(bill)}
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      className={`bill-status-btn ${status[bill.id] ? "paid" : "unpaid"}`}
                      onClick={() => togglePaid(bill.id)}
                    >
                      {status[bill.id] ? (
                        <><CheckCircle2 size={15} /> Paid</>
                      ) : (
                        <><Circle size={15} /> Unpaid</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

