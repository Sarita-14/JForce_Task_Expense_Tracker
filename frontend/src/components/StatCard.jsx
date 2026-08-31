export default function StatCard({ icon: Icon, label, value, accent, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${accent}1f`, color: accent }}>
        <Icon size={20} />
      </div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  );
}