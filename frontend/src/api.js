// Uses a relative path so requests go through the Vite dev server's proxy
// (see vite.config.js -> server.proxy["/api"]) straight to your local
// backend on http://localhost:4000. This sidesteps CORS entirely and means
// you don't depend on the (currently unreachable) production deployment.
//
// If you later deploy the frontend somewhere and want it to talk to the
// deployed backend again, change this back to:
//   const API_URL = "https://expinse.vercel.app";
const API_URL = "";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
  } catch (networkError) {
    // fetch() throws (rather than resolving with a response) when the
    // request never reached a server at all — DNS failure, no internet,
    // the backend being down, or a CORS preflight getting rejected.
    // Surface something actionable instead of the raw "Failed to fetch".
    console.error("Network error calling", API_URL + path, networkError);
    const error = new Error(
      "Couldn't reach the server. Check your internet connection, or that " +
        "the backend at " +
        API_URL +
        " is up (open it directly in a new tab to check)."
    );
    error.isNetworkError = true;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  login: (username, password) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    }),

  register: (username, password, email, fullName) =>
    request("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email, fullName })
    }),

  getExpenses: (username) =>
    request(`/api/expenses/${encodeURIComponent(username)}`),

  addExpense: (payload) =>
    request("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateExpense: (id, payload) =>
    request(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deleteExpense: (id) =>
    request(`/api/expenses/${id}`, {
      method: "DELETE"
    }),

  // AI features
  getAIInsights: (expenses, categoryMap) =>
    request("/api/ai/insights", {
      method: "POST",
      body: JSON.stringify({ expenses, categoryMap })
    }),

  suggestBudget: (expenses) =>
    request("/api/ai/suggest-budget", {
      method: "POST",
      body: JSON.stringify({ expenses })
    }),

  chatWithAI: (expenses, categoryMap, message, history) =>
    request("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ expenses, categoryMap, message, history })
    })
};