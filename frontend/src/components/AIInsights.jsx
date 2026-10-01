import { useEffect, useState } from "react";
import { AlertTriangle, Info, Lightbulb, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { api } from "../api.js";

const TYPE_CONFIG = {
  info: {
    icon: Info,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)"
  },
  warning: {
    icon: AlertTriangle,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)"
  },
  tip: {
    icon: Lightbulb,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)"
  },
  success: {
    icon: TrendingUp,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)"
  }
};

export default function AIInsights({ expenses, categoryMap }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  async function fetchInsights() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAIInsights(expenses, categoryMap);
      if (data.success) {
        setInsights(data.insights);
        setLoaded(true);
      } else {
        setError(data.message || "Failed to load insights.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (expenses.length > 0) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="card ai-insights-card">
      <div className="card-heading">
        <h2>
          <Sparkles size={18} />
          AI Insights
        </h2>
        {loaded && (
          <button
            className="link-btn"
            onClick={fetchInsights}
            disabled={loading}
            title="Refresh insights"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </div>

      {loading && !loaded && (
        <div className="ai-insights-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ai-skeleton-item">
              <div className="ai-skeleton-icon" />
              <div className="ai-skeleton-body">
                <div className="ai-skeleton-title" />
                <div className="ai-skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="ai-insights-error">
          <p>{error}</p>
          <button className="secondary-btn" onClick={fetchInsights}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && insights.length > 0 && (
        <div className="ai-insights-grid">
          {insights.map((insight, index) => {
            const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <div
                key={index}
                className="ai-insight-item"
                style={{
                  background: config.bg,
                  borderColor: config.border
                }}
              >
                <span
                  className="ai-insight-icon"
                  style={{ color: config.color }}
                >
                  <Icon size={16} />
                </span>
                <div className="ai-insight-body">
                  <span className="ai-insight-title" style={{ color: config.color }}>
                    {insight.title}
                  </span>
                  <span className="ai-insight-message">{insight.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && expenses.length === 0 && (
        <p className="dashboard-description">
          Add some expenses and your personalized AI insights will appear here.
        </p>
      )}
    </section>
  );
}