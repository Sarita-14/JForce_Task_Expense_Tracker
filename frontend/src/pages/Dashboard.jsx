import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ListPlus,
  ListChecks,
  Loader2,
  PiggyBank,
  Receipt,
  Sparkles,
  Sun,
  TrendingUp,
  Wallet
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import StatCard from "../components/StatCard.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import AIInsights from "../components/AIInsights.jsx";
import { CATEGORIES, getCategory } from "../utils/categories.js";
import { api } from "../api.js";
import {
  formatCurrency,
  formatDate,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  monthLabel
} from "../utils/format.js";

export default function Dashboard({
  user,
  expenses,
  categoryMap,
  budget,
  onSetBudget,
  onAdd,
  onList
}) {
  const [budgetInput, setBudgetInput] = useState(budget || "");
  const [editingBudget, setEditingBudget] = useState(false);
  const [aibudgetLoading, setAiBudgetLoading] = useState(false);
  const [aiBudgetReason, setAiBudgetReason] = useState(null);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const thisMonth = expenses.filter((e) => isSameMonth(e.date));
    const thisMonthTotal = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);
    const average = expenses.length ? total / expenses.length : 0;

    return {
      total,
      thisMonthTotal,
      average,
      count: expenses.length
    };
  }, [expenses]);

  const periodTotals = useMemo(() => {
    const sumWhere = (predicate) =>
      expenses
        .filter((expense) => predicate(expense.date))
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      day: sumWhere((date) => isSameDay(date)),
      week: sumWhere((date) => isSameWeek(date)),
      month: sumWhere((date) => isSameMonth(date)),
      year: sumWhere((date) => isSameYear(date))
    };
  }, [expenses]);

  const categoryData = useMemo(() => {
    const totals = {};

    expenses.forEach((expense) => {
      const categoryId = categoryMap[expense.id] || "other";
      totals[categoryId] = (totals[categoryId] || 0) + Number(expense.amount);
    });

    return Object.entries(totals)
      .map(([id, value]) => ({
        id,
        name: getCategory(id).label,
        value,
        color: getCategory(id).color
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, categoryMap]);

  const monthlyData = useMemo(() => {
    const totals = {};

    expenses.forEach((expense) => {
      const key = monthLabel(expense.date);
      if (!key) return;
      totals[key] = (totals[key] || 0) + Number(expense.amount);
    });

    return Object.entries(totals)
      .map(([month, amount]) => ({ month, amount }))
      .slice(-6);
  }, [expenses]);

  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [expenses]
  );

  const budgetPercent = budget > 0 ? Math.min(100, (stats.thisMonthTotal / budget) * 100) : 0;
  const overBudget = budget > 0 && stats.thisMonthTotal > budget;

  function saveBudget(event) {
    event.preventDefault();
    const value = Number(budgetInput);
    onSetBudget(Number.isFinite(value) && value > 0 ? value : 0);
    setEditingBudget(false);
    setAiBudgetReason(null);
  }

  async function handleAISuggestBudget() {
    setAiBudgetLoading(true);
    setAiBudgetReason(null);
    try {
      const data = await api.suggestBudget(expenses);
      if (data.success) {
        setBudgetInput(String(data.budget));
        setAiBudgetReason(data.reason);
        setEditingBudget(true);
      }
    } catch {
      // silently fail — user can try again
    } finally {
      setAiBudgetLoading(false);
    }
  }

  return (
    <main className="dashboard">
            <section className="card dashboard-hero">
        <div>
          <p className="home-paradise-welcome">Welcome back, {user.fullName?.split(" ")[0] || user.username} 👋</p>
          <h1 className="home-paradise-title">🏠 Home Paradise</h1>
          <p className="dashboard-description">
            Your monthly home expenses at a glance — bills, groceries, transport and more.
          </p>
          <div className="dashboard-links">
            <button className="primary-btn" onClick={onAdd}>
              <ListPlus size={17} />
              Add Expense
            </button>
            <button className="secondary-btn" onClick={onList}>
              <ListChecks size={17} />
              Expense List
            </button>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard
          icon={Wallet}
          label="Total Spent"
          value={formatCurrency(stats.total)}
          accent="#6366f1"
        />
        <StatCard
          icon={CalendarRange}
          label="This Month"
          value={formatCurrency(stats.thisMonthTotal)}
          accent="#0ea5e9"
        />
        <StatCard
          icon={Receipt}
          label="Total Expenses"
          value={stats.count}
          accent="#f97316"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Expense"
          value={formatCurrency(stats.average)}
          accent="#10b981"
        />
      </section>

      <AIInsights expenses={expenses} categoryMap={categoryMap} />

      <section className="card">
        <div className="card-heading">
          <h2>
            <CalendarClock size={18} /> Spending Overview
          </h2>
        </div>

        <div className="period-grid">
          <div className="period-item">
            <span className="period-icon" style={{ background: "#fef3c7", color: "#b45309" }}>
              <Sun size={16} />
            </span>
            <span className="period-label">Today</span>
            <span className="period-value">{formatCurrency(periodTotals.day)}</span>
          </div>

          <div className="period-item">
            <span className="period-icon" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
              <CalendarDays size={16} />
            </span>
            <span className="period-label">This Week</span>
            <span className="period-value">{formatCurrency(periodTotals.week)}</span>
          </div>

          <div className="period-item">
            <span className="period-icon" style={{ background: "#ede9fe", color: "#6d28d9" }}>
              <CalendarRange size={16} />
            </span>
            <span className="period-label">This Month</span>
            <span className="period-value">{formatCurrency(periodTotals.month)}</span>
          </div>

          <div className="period-item">
            <span className="period-icon" style={{ background: "#d1fae5", color: "#047857" }}>
              <TrendingUp size={16} />
            </span>
            <span className="period-label">This Year</span>
            <span className="period-value">{formatCurrency(periodTotals.year)}</span>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card budget-card">
          <div className="card-heading">
            <h2>
              <PiggyBank size={18} /> Monthly Budget
            </h2>
            <div className="budget-heading-actions">
              <button
                className="link-btn ai-suggest-btn"
                onClick={handleAISuggestBudget}
                disabled={aibudgetLoading || expenses.length === 0}
                title={expenses.length === 0 ? "Add expenses first" : "Let AI suggest a budget"}
              >
                {aibudgetLoading
                  ? <Loader2 size={13} className="spin" />
                  : <Sparkles size={13} />}
                {aibudgetLoading ? "Thinking…" : "Suggest with AI"}
              </button>
              <button className="link-btn" onClick={() => { setEditingBudget((v) => !v); setAiBudgetReason(null); }}>
                {budget > 0 ? "Edit" : "Set budget"}
              </button>
            </div>
          </div>

          {editingBudget ? (
            <>
              {aiBudgetReason && (
                <p className="ai-budget-reason">
                  <Sparkles size={12} /> {aiBudgetReason}
                </p>
              )}
              <form className="budget-form" onSubmit={saveBudget}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 15000"
                  value={budgetInput}
                  onChange={(event) => setBudgetInput(event.target.value)}
                  autoFocus
                />
                <button className="primary-btn" type="submit">
                  Save
                </button>
              </form>
            </>
          ) : budget > 0 ? (
            <>
              <div className="budget-progress-track">
                <div
                  className={`budget-progress-fill ${overBudget ? "over" : ""}`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
              <p className={`budget-status ${overBudget ? "over" : ""}`}>
                {formatCurrency(stats.thisMonthTotal)} of {formatCurrency(budget)} spent
                this month{overBudget ? " — you're over budget" : ""}
              </p>
            </>
          ) : (
            <p className="dashboard-description">
              Set a monthly budget to track how your spending compares as the
              month progresses.
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-heading">
            <h2>Spending by Category</h2>
          </div>

          {categoryData.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No data yet"
              description="Add an expense to see your category breakdown."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card dashboard-grid-wide">
          <div className="card-heading">
            <h2>Monthly Trend</h2>
          </div>

          {monthlyData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Nothing to chart yet"
              description="Your monthly spending trend will appear here."
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-heading">
          <h2>Recent Expenses</h2>
          <button className="link-btn" onClick={onList}>
            View all
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Your most recent expenses will show up here."
          />
        ) : (
          <div className="recent-list">
            {recentExpenses.map((expense) => (
              <div className="recent-item" key={expense.id}>
                <CategoryBadge categoryId={categoryMap[expense.id]} size="sm" />
                <div className="recent-item-body">
                  <span className="recent-item-title">{expense.title}</span>
                  <span className="recent-item-date">{formatDate(expense.date)}</span>
                </div>
                <span className="recent-item-amount">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}