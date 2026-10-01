import { useEffect, useState } from "react";
import "./App.css";
import { api } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import UpdateExpense from "./pages/UpdateExpense.jsx";
import ExpenseList from "./pages/ExpenseList.jsx";
import { useToast } from "./context/ToastContext.jsx";
import { suggestCategory } from "./utils/categories.js";
import AIChatbot from "./components/AIChatbot.jsx";
import {
  loadBudget,
  loadCategoryMap,
  saveBudget,
  saveCategoryFor
} from "./utils/localData.js";
import {
  currentYearMonth,
  loadBills,
  loadBillStatus,
  matchBill,
  saveBillStatus,
  saveBills
} from "./utils/bills.js";
import MonthlyBills from "./pages/MonthlyBills.jsx";

function App() {
  const { showToast } = useToast();

  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [budget, setBudget] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
    const [bills, setBills] = useState([]);
  const [billStatus, setBillStatus] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("expenseUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
            setCategoryMap(loadCategoryMap(parsedUser.username));
      setBudget(loadBudget(parsedUser.username));
      setBills(loadBills(parsedUser.username));
      setBillStatus({ [currentYearMonth()]: loadBillStatus(parsedUser.username, currentYearMonth()) });
      setPage("dashboard");
    }
  }, []);

  useEffect(() => {
    if (user) loadExpenses(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function login(username, password) {
    setAuthLoading(true);
    try {
      const data = await api.login(username, password);
      setUser(data.user);
      localStorage.setItem("expenseUser", JSON.stringify(data.user));
      setCategoryMap(loadCategoryMap(data.user.username));
      setBudget(loadBudget(data.user.username));
      setBills(loadBills(data.user.username));
      setBillStatus({ [currentYearMonth()]: loadBillStatus(data.user.username, currentYearMonth()) });
      setPage("dashboard");
      showToast(
        `Welcome back, ${data.user.fullName?.split(" ")[0] || data.user.username}!`,
        "success"
      );
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function register(username, password, email, fullName) {
    setAuthLoading(true);
    try {
      await api.register(username, password, email, fullName);
      showToast("Registration successful. Please login.", "success");
      setPage("login");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadExpenses(activeUser = user) {
    if (!activeUser) return;
    setExpensesLoading(true);
    try {
      const data = await api.getExpenses(activeUser.username);
      setExpenses(data.expenses);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setExpensesLoading(false);
    }
  }

  async function addExpense({ title, amount, date, description, category }) {
    setFormLoading(true);
    try {
      const data = await api.addExpense({
        username: user.username,
        title,
        amount,
        date,
        description
      });

      const categoryId = category || suggestCategory(title);
            saveCategoryFor(user.username, data.expenseId, categoryId);
      setCategoryMap((current) => ({ ...current, [data.expenseId]: categoryId }));

      // Auto-mark matching bill as paid
      const matchedBillId = matchBill(categoryId, bills);
      if (matchedBillId) {
        const ym = currentYearMonth();
        const nextStatus = { ...(billStatus[ym] || {}), [matchedBillId]: true };
        saveBillStatus(user.username, ym, nextStatus);
        setBillStatus((prev) => ({ ...prev, [ym]: nextStatus }));
      }

      showToast("Expense added successfully.", "success");
      setPage("list");
      await loadExpenses();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setFormLoading(false);
    }
  }

  async function updateExpense(id, { title, amount, date, description, category }) {
    setFormLoading(true);
    try {
      await api.updateExpense(id, { title, amount, date, description });

      saveCategoryFor(user.username, id, category);
      setCategoryMap((current) => ({ ...current, [id]: category }));

      showToast("Expense updated successfully.", "success");
      setSelectedExpense(null);
      setPage("list");
      await loadExpenses();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setFormLoading(false);
    }
  }

  async function deleteExpense(id) {
    try {
      await api.deleteExpense(id);
      showToast("Expense deleted successfully.", "success");
      await loadExpenses();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function handleSetBudget(amount) {
    saveBudget(user.username, amount);
    setBudget(amount);
    showToast(amount > 0 ? "Budget updated." : "Budget cleared.", "success");
  }

  function logout() {
    localStorage.removeItem("expenseUser");
    setUser(null);
       setExpenses([]);
    setCategoryMap({});
    setBudget(0);
    setBills([]);
    setBillStatus({});
    setPage("login");
  }

  if (!user) {
    if (page === "register") {
      return (
        <Register
          onRegister={register}
          onLogin={() => setPage("login")}
          loading={authLoading}
        />
      );
    }

    return (
      <Login
        onLogin={login}
        onRegister={() => setPage("register")}
        loading={authLoading}
      />
    );
  }

  return (
    <div className="app-container">
      <Navbar
        page={page}
        user={user}
        onLogout={logout}
        onNavigate={(target) => {
          if (target === "list") loadExpenses();
          setPage(target);
        }}
      />

      {page === "dashboard" && (
        <Dashboard
          user={user}
          expenses={expenses}
          categoryMap={categoryMap}
          budget={budget}
          onSetBudget={handleSetBudget}
          onAdd={() => setPage("add")}
          onList={() => {
            loadExpenses();
            setPage("list");
          }}
        />
      )}

      {page === "add" && (
        <AddExpense
          onAdd={addExpense}
          onCancel={() => setPage("dashboard")}
          loading={formLoading}
        />
      )}

      {page === "list" && (
        <ExpenseList
          expenses={expenses}
          categoryMap={categoryMap}
          loading={expensesLoading}
          onEdit={(expense) => {
            setSelectedExpense(expense);
            setPage("update");
          }}
          onDelete={deleteExpense}
        />
      )}

      {page === "update" && selectedExpense && (
        <UpdateExpense
          expense={selectedExpense}
          initialCategory={categoryMap[selectedExpense.id]}
          onUpdate={updateExpense}
          onCancel={() => setPage("list")}
          loading={formLoading}
        />
      )}

            {page === "bills" && (
        <MonthlyBills
          username={user.username}
          bills={bills}
          billStatus={billStatus}
          onBillsChange={(updated) => {
            saveBills(user.username, updated);
            setBills(updated);
          }}
          onStatusChange={(ym, next) => {
            saveBillStatus(user.username, ym, next);
            setBillStatus((prev) => ({ ...prev, [ym]: next }));
          }}
        />
      )}

      <AIChatbot expenses={expenses} categoryMap={categoryMap} />
    </div>
  );
}

export default App;