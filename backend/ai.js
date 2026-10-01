import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// --------------------------------------------------------------------------
// Guard – fail fast with a clear message if the key is missing
// --------------------------------------------------------------------------

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "\n❌  GEMINI_API_KEY is not set in your .env file.\n" +
    "   Get a free key at https://aistudio.google.com → \"Get API Key\"\n" +
    "   Then add this line to backend/.env:\n" +
    "   GEMINI_API_KEY=your_key_here\n"
  );
}

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to backend/.env and restart the server."
    );
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
}

// --------------------------------------------------------------------------
// Robust JSON extractor — handles markdown fences, leading text, trailing text
// --------------------------------------------------------------------------

function extractJSON(text) {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  // 2. Try to find a JSON array [...] first (for insights)
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return JSON.parse(arrayMatch[0]);
  }

  // 3. Try to find a JSON object {...} (for budget suggestion)
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return JSON.parse(objectMatch[0]);
  }

  // 4. Last resort — try parsing the whole cleaned string
  return JSON.parse(cleaned);
}

// --------------------------------------------------------------------------
// Retry helper — 503 "high demand" is transient; wait and retry up to 5x
// --------------------------------------------------------------------------

async function generateWithRetry(model, prompt, retries = 8) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        const wait = 5000 + i * 3000; // 5s, 8s, 11s, 14s ...
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
}

function buildSummary(expenses, categoryMap = {}) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const categoryTotals = {};
  expenses.forEach((e) => {
    const cat = categoryMap[e.id] || "other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);
  });

  const monthlyTotals = {};
  expenses.forEach((e) => {
    const month = e.date ? String(e.date).substring(0, 7) : "unknown";
    monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(e.amount);
  });

  return { total, categoryTotals, monthlyTotals };
}

// --------------------------------------------------------------------------
// 1. AI Spending Insights
// --------------------------------------------------------------------------

export async function getSpendingInsights(expenses, categoryMap) {
  const { total, categoryTotals, monthlyTotals } = buildSummary(
    expenses,
    categoryMap
  );

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `- ${cat}: Rs.${amt.toFixed(2)}`)
    .join("\n");

  const recentMonths = Object.entries(monthlyTotals)
    .sort()
    .slice(-4)
    .map(([month, amt]) => `- ${month}: Rs.${amt.toFixed(2)}`)
    .join("\n");

  const recent5 = expenses
    .slice(0, 5)
    .map((e) => `${e.title} Rs.${e.amount} on ${e.date}`)
    .join(", ");

  const prompt = `You are a personal finance assistant. Analyze this expense data and give exactly 4 short, actionable insights.

Total: Rs.${total.toFixed(2)} across ${expenses.length} transactions

By category:
${topCategories || "- No category data"}

Monthly (recent):
${recentMonths || "- No monthly data"}

Recent: ${recent5 || "none"}

Respond with ONLY a JSON array, nothing else:
[{"type":"info","title":"Title Here","message":"One sentence."},{"type":"warning","title":"Title","message":"One sentence."},{"type":"tip","title":"Title","message":"One sentence."},{"type":"success","title":"Title","message":"One sentence."}]

type must be one of: info, warning, tip, success`;

  const model = getModel();
 const result = await generateWithRetry(model, prompt);
  const raw = result.response.text();
  console.log("[AI Insights] Raw response:", raw.substring(0, 200));

  try {
    return extractJSON(raw);
  } catch (parseError) {
    console.error("[AI Insights] JSON parse failed:", parseError.message, "\nRaw:", raw);
    throw new Error("AI returned an unexpected format. Please try again.");
  }
}

// --------------------------------------------------------------------------
// 2. AI Budget Suggestion
// --------------------------------------------------------------------------

export async function suggestBudget(expenses) {
  const { monthlyTotals } = buildSummary(expenses);
  const months = Object.entries(monthlyTotals).sort();
  const recent = months.slice(-3);

  if (recent.length === 0) {
    return {
      budget: 10000,
      reason: "No spending history yet — starting with a sensible default of Rs.10,000."
    };
  }

  const avg = recent.reduce((s, [, v]) => s + v, 0) / recent.length;

  const prompt = `You are a personal finance assistant.

Recent monthly spending:
${recent.map(([month, amt]) => `- ${month}: Rs.${amt.toFixed(2)}`).join("\n")}
Average: Rs.${avg.toFixed(2)}/month

Suggest a realistic monthly budget with a 10% buffer above the average.

Respond with ONLY JSON, nothing else:
{"budget":15000,"reason":"One sentence explaining the suggestion."}

budget must be an integer rounded to the nearest 500.`;

  const model = getModel();
  const result = await generateWithRetry(model, prompt);
  const raw = result.response.text();
  console.log("[AI Budget] Raw response:", raw.substring(0, 200));

  try {
    return extractJSON(raw);
  } catch (parseError) {
    console.error("[AI Budget] JSON parse failed:", parseError.message, "\nRaw:", raw);
    throw new Error("AI returned an unexpected format. Please try again.");
  }
}

// --------------------------------------------------------------------------
// 3. AI Finance Chatbot
// --------------------------------------------------------------------------

export async function chatWithAI(expenses, categoryMap, userMessage, history) {
  const { total, categoryTotals, monthlyTotals } = buildSummary(
    expenses,
    categoryMap
  );

  const topCats = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c, a]) => `${c}: Rs.${a.toFixed(2)}`)
    .join(", ");

  const recentMonths = Object.entries(monthlyTotals)
    .sort()
    .slice(-3)
    .map(([m, a]) => `${m}: Rs.${a.toFixed(2)}`)
    .join(", ");

  const last5 = expenses
    .slice(0, 5)
    .map((e) => `${e.title} Rs.${e.amount} (${e.date})`)
    .join(", ");

  const conversationHistory = (history || [])
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const fullPrompt = `You are a helpful personal finance assistant. Be concise (2-3 sentences). Use Rs. for currency.

User's data:
- Total spent: Rs.${total.toFixed(2)} across ${expenses.length} transactions
- Top categories: ${topCats || "none yet"}
- Recent months: ${recentMonths || "no data"}
- Last 5 expenses: ${last5 || "none"}

${conversationHistory ? `Conversation so far:\n${conversationHistory}\n` : ""}User: ${userMessage}
Assistant:`;

  const model = getModel();
  const result = await generateWithRetry(model, fullPrompt);
  return result.response.text().trim();
}