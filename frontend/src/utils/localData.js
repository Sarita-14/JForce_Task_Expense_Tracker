// The backend API (see /backend/index.js) does not yet persist a "category"
// or "budget" field for expenses. Rather than blocking these features on a
// backend/DB migration, we layer them on top locally per logged-in user.
// This keeps the app fully usable today, and the shape here is deliberately
// simple so it can be swapped for real API calls later (see README-UPGRADES.md).

function categoryKey(username) {
  return `expenseCategories:${username}`;
}

function budgetKey(username) {
  return `expenseBudget:${username}`;
}

export function loadCategoryMap(username) {
  try {
    const raw = localStorage.getItem(categoryKey(username));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCategoryFor(username, expenseId, categoryId) {
  const map = loadCategoryMap(username);
  map[expenseId] = categoryId;
  localStorage.setItem(categoryKey(username), JSON.stringify(map));
}

export function loadBudget(username) {
  const raw = localStorage.getItem(budgetKey(username));
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function saveBudget(username, amount) {
  localStorage.setItem(budgetKey(username), String(amount));
}