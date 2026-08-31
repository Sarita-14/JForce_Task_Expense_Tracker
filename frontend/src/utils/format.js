export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function monthLabel(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function isSameMonth(dateString, reference = new Date()) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getMonth() === reference.getMonth() &&
    date.getFullYear() === reference.getFullYear()
  );
}

export function isSameDay(dateString, reference = new Date()) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getDate() === reference.getDate() &&
    date.getMonth() === reference.getMonth() &&
    date.getFullYear() === reference.getFullYear()
  );
}

// Week = Monday to Sunday containing the reference date.
export function isSameWeek(dateString, reference = new Date()) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const startOfWeek = new Date(reference);
  const day = startOfWeek.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

export function isSameYear(dateString, reference = new Date()) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === reference.getFullYear();
}