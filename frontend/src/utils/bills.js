// Home Paradise — fixed monthly bills config & localStorage helpers.

export const DEFAULT_BILLS = [
  { id: "milk",        name: "Milk Bill",        category: "milk",        amount: 2500 },
  { id: "electricity", name: "Electricity Bill",  category: "electricity", amount: 0 },
  { id: "maintenance", name: "Maintenance",        category: "maintenance", amount: 0},
  { id: "cleaner",     name: "House Cleaner",      category: "cleaner",     amount: 1000 },
  { id: "press",       name: "Clothes Press",      category: "press",       amount: 0 },
  { id: "ration",      name: "Ration & Groceries", category: "ration",      amount: 0},
  { id: "pocket",      name: "Pocket Money",       category: "pocket",      amount: 0 },
];

// ── Bills config (names + fixed amounts) ──────────────────────────────────
export function loadBills(username) {
  try {
    const raw = localStorage.getItem(`hp_bills_${username}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_BILLS;
}

export function saveBills(username, bills) {
  localStorage.setItem(`hp_bills_${username}`, JSON.stringify(bills));
}

// ── Payment status per month (key = "YYYY-MM") ───────────────────────────
export function loadBillStatus(username, yearMonth) {
  try {
    const raw = localStorage.getItem(`hp_bs_${username}_${yearMonth}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveBillStatus(username, yearMonth, status) {
  localStorage.setItem(`hp_bs_${username}_${yearMonth}`, JSON.stringify(status));
}

// ── Auto-detect: does a new expense match a bill? ─────────────────────────
// Returns the bill id if matched, null otherwise.
export function matchBill(categoryId, bills) {
  if (!categoryId) return null;
  const match = bills.find((b) => b.category === categoryId);
  return match ? match.id : null;
}

// ── Current month helper ──────────────────────────────────────────────────
export function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}