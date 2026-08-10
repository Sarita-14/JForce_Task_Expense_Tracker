import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [page, setPage] =
    useState("login");

  const [user, setUser] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [expenses, setExpenses] =
    useState([]);

  const [selectedExpense, setSelectedExpense] =
    useState(null);

  useEffect(() => {

    const savedUser =
      localStorage.getItem("expenseUser");

    if (savedUser) {

      setUser(
        JSON.parse(savedUser)
      );

      setPage("dashboard");
    }

  }, []);

  function showMessage(text) {

    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  async function login(username, password) {

    try {

      const response =
        await fetch("/api/login", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            username,
            password
          })
        });

      const data =
        await response.json();

      if (!response.ok) {
        showMessage(data.message);
        return;
      }

      setUser(data.user);

      localStorage.setItem(
        "expenseUser",
        JSON.stringify(data.user)
      );

      setPage("dashboard");

    } catch (error) {

      showMessage(
        "Unable to connect to server."
      );
    }
  }

  async function register(
    username,
    password,
    email,
    fullName
  ) {

    try {

      const response =
        await fetch("/api/register", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            username,
            password,
            email,
            fullName
          })
        });

      const data =
        await response.json();

      if (!response.ok) {
        showMessage(data.message);
        return;
      }

      showMessage(
        "Registration successful. Please login."
      );

      setPage("login");

    } catch (error) {

      showMessage(
        "Unable to connect to server."
      );
    }
  }

  async function loadExpenses() {

    if (!user) return;

    try {

      const response =
        await fetch(
          `/api/expenses/${encodeURIComponent(
            user.username
          )}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        showMessage(data.message);
        return;
      }

      setExpenses(data.expenses);

    } catch (error) {

      showMessage(
        "Unable to load expenses."
      );
    }
  }

  async function addExpense(
    title,
    amount,
    date,
    description
  ) {

    try {

      const response =
        await fetch("/api/expenses", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            username:
              user.username,

            title,

            amount,

            date,

            description
          })
        });

      const data =
        await response.json();

      if (!response.ok) {

        showMessage(data.message);

        return false;
      }

      showMessage(
        "Expense added successfully."
      );

      setPage("list");

      await loadExpenses();

      return true;

    } catch (error) {

      showMessage(
        "Unable to add expense."
      );

      return false;
    }
  }

  async function updateExpense(
    id,
    title,
    amount,
    date,
    description
  ) {

    try {

      const response =
        await fetch(
          `/api/expenses/${id}`,
          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              title,

              amount,

              date,

              description
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        showMessage(data.message);

        return false;
      }

      showMessage(
        "Expense updated successfully."
      );

      setSelectedExpense(null);

      setPage("list");

      await loadExpenses();

      return true;

    } catch (error) {

      showMessage(
        "Unable to update expense."
      );

      return false;
    }
  }

  async function deleteExpense(id) {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this expense?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response =
        await fetch(
          `/api/expenses/${id}`,
          {
            method: "DELETE"
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        showMessage(data.message);

        return;
      }

      showMessage(
        "Expense deleted successfully."
      );

      await loadExpenses();

    } catch (error) {

      showMessage(
        "Unable to delete expense."
      );
    }
  }

  function logout() {

    localStorage.removeItem(
      "expenseUser"
    );

    setUser(null);

    setExpenses([]);

    setPage("login");
  }

  if (!user) {

    if (page === "register") {

      return (
        <>
          <Register
            onRegister={register}
            onLogin={() => {
              setMessage("");
              setPage("login");
            }}
          />

          {message && (
            <div className="toast">
              {message}
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <Login
          onLogin={login}
          onRegister={() => {
            setMessage("");
            setPage("register");
          }}
        />

        {message && (
          <div className="toast">
            {message}
          </div>
        )}
      </>
    );
  }

  return (

    <div className="app-container">

      <nav className="navbar">

        <div className="nav-title">
          Expense Tracker
        </div>

        <div className="nav-links">

          <button
            onClick={() => {
              setPage("dashboard");
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              setPage("add");
            }}
          >
            Add Expense
          </button>

          <button
            onClick={() => {
              loadExpenses();
              setPage("list");
            }}
          >
            Expense List
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {page === "dashboard" && (

        <Dashboard
          user={user}
          onAdd={() =>
            setPage("add")
          }
          onList={() => {
            loadExpenses();
            setPage("list");
          }}
        />

      )}

      {page === "add" && (

        <AddExpense
          onAdd={addExpense}
          onCancel={() =>
            setPage("dashboard")
          }
        />

      )}

      {page === "list" && (

        <ExpenseList
          expenses={expenses}
          onEdit={(expense) => {

            setSelectedExpense(
              expense
            );

            setPage("update");
          }}
          onDelete={deleteExpense}
        />

      )}

      {page === "update" &&
        selectedExpense && (

          <UpdateExpense
            expense={selectedExpense}
            onUpdate={updateExpense}
            onCancel={() =>
              setPage("list")
            }
          />

        )}

    </div>
  );
}

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

function Login({
  onLogin,
  onRegister
}) {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  function handleSubmit(e) {

    e.preventDefault();

    onLogin(
      username,
      password
    );
  }

  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>Login</h1>

        <p className="subtitle">
          Login to manage your expenses
        </p>

        <form
          onSubmit={handleSubmit}
          className="form"
        >

          <label>
            Username

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Enter username"
              required
            />

          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter password"
              required
            />

          </label>

          <button
            className="primary-btn"
            type="submit"
          >
            Login
          </button>

        </form>

        <p className="register-text">
          New user?

          <button
            className="link-btn"
            onClick={onRegister}
          >
            Register here
          </button>

        </p>

      </div>

    </div>
  );
}

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

function Register({
  onRegister,
  onLogin
}) {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  function handleSubmit(e) {

    e.preventDefault();

    onRegister(
      username,
      password,
      email,
      fullName
    );
  }

  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>Registration</h1>

        <form
          onSubmit={handleSubmit}
          className="form"
        >

          <label>
            Username

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              required
            />

          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

          </label>

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />

          </label>

          <label>
            Full Name

            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              required
            />

          </label>

          <button
            className="primary-btn"
            type="submit"
          >
            Register
          </button>

        </form>

        <p className="register-text">

          Already have an account?

          <button
            className="link-btn"
            onClick={onLogin}
          >
            Login here
          </button>

        </p>

      </div>

    </div>
  );
}

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

function Dashboard({
  user,
  onAdd,
  onList
}) {

  return (

    <main className="card dashboard-card">

      <h1>
        Welcome to Expense Tracker
      </h1>

      <p className="welcome-user">
        Welcome, {user.fullName}
      </p>

      <p className="dashboard-description">
        Track and manage your expenses
        effectively. Use the navigation
        links to add new expenses or view
        your expense history.
      </p>

      <div className="dashboard-links">

        <button
          className="dashboard-button"
          onClick={onAdd}
        >
          Add Expense
        </button>

        <button
          className="dashboard-button"
          onClick={onList}
        >
          Expense List
        </button>

      </div>

    </main>
  );
}

// --------------------------------------------------
// ADD EXPENSE
// --------------------------------------------------

function AddExpense({
  onAdd,
  onCancel
}) {

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [date, setDate] =
    useState("");

  const [description, setDescription] =
    useState("");

  function handleSubmit(e) {

    e.preventDefault();

    onAdd(
      title,
      amount,
      date,
      description
    );
  }

  return (

    <main className="card form-card">

      <h1>Add New Expense</h1>

      <form
        className="form"
        onSubmit={handleSubmit}
      >

        <label>
          Expense Name

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />

        </label>

        <label>
          Amount

          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            required
          />

        </label>

        <label>
          Date

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
          />

        </label>

        <label>
          Description

          <textarea
            rows="4"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

        </label>

        <div className="form-buttons">

          <button
            type="submit"
            className="primary-btn"
          >
            Add Expense
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

        </div>

      </form>

    </main>
  );
}

// --------------------------------------------------
// UPDATE EXPENSE
// --------------------------------------------------

function UpdateExpense({
  expense,
  onUpdate,
  onCancel
}) {

  const [title, setTitle] =
    useState(expense.title);

  const [amount, setAmount] =
    useState(expense.amount);

  const [date, setDate] =
    useState(expense.date);

  const [description, setDescription] =
    useState(
      expense.description || ""
    );

  function handleSubmit(e) {

    e.preventDefault();

    onUpdate(
      expense.id,
      title,
      amount,
      date,
      description
    );
  }

  return (

    <main className="card form-card">

      <h1>Update Expense</h1>

      <form
        className="form"
        onSubmit={handleSubmit}
      >

        <label>
          Expense Name

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />

        </label>

        <label>
          Amount

          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            required
          />

        </label>

        <label>
          Date

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
          />

        </label>

        <label>
          Description

          <textarea
            rows="4"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

        </label>

        <div className="form-buttons">

          <button
            type="submit"
            className="primary-btn"
          >
            Update Expense
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

        </div>

      </form>

    </main>
  );
}

// --------------------------------------------------
// EXPENSE LIST
// --------------------------------------------------

function ExpenseList({
  expenses,
  onEdit,
  onDelete
}) {

  return (

    <main className="card list-card">

      <h1>Expense List</h1>

      {expenses.length === 0 ? (

        <div className="empty">

          <p>
            No expenses found.
          </p>

        </div>

      ) : (

        <div className="expense-list">

          {expenses.map(
            (expense) => (

              <div
                className="expense-item"
                key={expense.id}
              >

                <div className="expense-info">

                  <h2>
                    {expense.title}
                  </h2>

                  <p>
                    <strong>
                      Amount:
                    </strong>{" "}
                    ₹{expense.amount}
                  </p>

                  <p>
                    <strong>
                      Date:
                    </strong>{" "}
                    {expense.date}
                  </p>

                  {expense.description && (

                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {expense.description}
                    </p>

                  )}

                </div>

                <div className="exercise-actions expense-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      onEdit(expense)
                    }
                  >
                    Update
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      onDelete(
                        expense.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </main>
  );
}

export default App;